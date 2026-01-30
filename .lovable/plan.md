
# Fix Profile Picture Upload, Add Cropping, Bio Validation & Dynamic Location Detection

## Issues Analysis

### Issue 1: Profile Picture Upload Not Working
**Root Cause:** After extensive analysis, the storage policies exist but there's a **missing DELETE policy** for profile-photos bucket. However, the more critical issue is that the upload code exists but something may be silently failing. The policies show:
- ✅ INSERT policy exists: `Users can upload their own photos` 
- ✅ SELECT policy exists: `Anyone can view profile photos`
- ❌ **DELETE policy missing** - users cannot remove their own photos

Additionally, both `PortalProfile.tsx` and `PortalOnboarding.tsx` have photo upload functionality but neither uses the existing `ImageCropper` component that's already built.

### Issue 2: Profile Picture Cropping Needed
**Current State:** An `ImageCropper` component already exists in `src/components/admin/ImageCropper.tsx` using `react-easy-crop`. However, it's not being used in the profile photo upload flow.

**Solution:** Integrate the existing cropper into the upload flow so users can crop before saving.

### Issue 3: Bio Gibberish Detection
**Current State:** No validation exists for bio content quality. Users can enter keyboard smash like "ejhjewgdujwegufhkwrhgergeg".

**Solution:** Implement a gibberish detection algorithm using:
1. **Vowel ratio check** - Real text has ~35-50% vowels; gibberish often has very low or very high
2. **Consonant cluster check** - More than 4-5 consecutive consonants is unusual
3. **Repeated character pattern** - Same char 3+ times in a row
4. **Entropy analysis** - Random strings have different entropy than natural language
5. **Character diversity** - Real words use varied letters

### Issue 4: Dynamic Location Detection with VPN Blocking
**Current State:** The `detect-location` edge function and `VpnBlockedModal` already exist but are only used in `PortalOnboarding.tsx`, not in `PortalProfile.tsx`.

**Solution:** 
1. Apply location detection to `PortalProfile.tsx` as well
2. Ensure VPN blocking is enforced in both onboarding and profile editing contexts

---

## Implementation Plan

### Step 1: Add Missing DELETE Policy for Profile Photos (Database Migration)

Add the storage policy to allow users to delete their own profile photos:

```sql
-- Allow users to delete their own profile photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Step 2: Create Gibberish Detection Utility

**New File:** `src/lib/text-validation.ts`

Implement a gibberish detection function that checks:

```typescript
export function isGibberish(text: string): { isGibberish: boolean; reason?: string } {
  // Skip short texts
  if (text.length < 20) return { isGibberish: false };
  
  const cleaned = text.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length < 10) return { isGibberish: false };
  
  // Check 1: Vowel ratio (English ~35-50%)
  const vowels = cleaned.match(/[aeiou]/g)?.length || 0;
  const vowelRatio = vowels / cleaned.length;
  if (vowelRatio < 0.15 || vowelRatio > 0.7) {
    return { isGibberish: true, reason: 'Unusual letter patterns detected' };
  }
  
  // Check 2: Consonant clusters (>5 consecutive is unusual)
  if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(cleaned)) {
    return { isGibberish: true, reason: 'Text appears to be random characters' };
  }
  
  // Check 3: Repeated characters (>3 same char in a row)
  if (/(.)\1{3,}/.test(cleaned)) {
    return { isGibberish: true, reason: 'Repeated characters detected' };
  }
  
  // Check 4: Word length distribution (random text has uniform-ish length)
  // Real text has short words like "a", "the", "is"
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const shortWords = words.filter(w => w.length <= 3).length;
  if (words.length > 5 && shortWords / words.length < 0.1) {
    return { isGibberish: true, reason: 'Text pattern is unusual' };
  }
  
  return { isGibberish: false };
}
```

### Step 3: Integrate Image Cropper into Profile Photo Upload

**Files to Modify:**
- `src/pages/portal/PortalProfile.tsx`
- `src/pages/portal/PortalOnboarding.tsx`

**Changes:**

1. When user selects a file, show the cropper dialog instead of uploading immediately
2. After cropping, upload the cropped blob
3. Use the existing `ImageCropper` component with 1:1 aspect ratio default for profile photos

```typescript
// State additions
const [cropperImage, setCropperImage] = useState<string | null>(null);
const [pendingFile, setPendingFile] = useState<File | null>(null);

// Modified upload handler
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate...
  
  // Show cropper instead of uploading directly
  const imageUrl = URL.createObjectURL(file);
  setCropperImage(imageUrl);
  setPendingFile(file);
};

// Handle crop complete
const handleCropComplete = async (croppedBlob: Blob) => {
  // Upload the cropped blob to storage
  // ... upload logic using cropped blob instead of original file
  setCropperImage(null);
};
```

### Step 4: Add Bio Validation with Gibberish Detection

**Files to Modify:**
- `src/pages/portal/PortalProfile.tsx`
- `src/pages/portal/PortalOnboarding.tsx`

**Changes:**

1. Import the `isGibberish` utility
2. Validate bio on form submission
3. Show inline error if gibberish detected

```typescript
import { isGibberish } from '@/lib/text-validation';

// In validation/submit handler
const bioCheck = isGibberish(bio);
if (bioCheck.isGibberish) {
  toast.error(`Please write a meaningful bio. ${bioCheck.reason}`);
  return;
}
```

### Step 5: Add Dynamic Location Detection to PortalProfile

**File to Modify:** `src/pages/portal/PortalProfile.tsx`

**Changes:**

1. Add VPN detection and blocking modal (reuse existing `VpnBlockedModal`)
2. Add auto-detect location button/functionality
3. Check for VPN on profile load

```typescript
import { VpnBlockedModal } from '@/components/portal/VpnBlockedModal';

// State
const [showVpnModal, setShowVpnModal] = useState(false);
const [isDetectingLocation, setIsDetectingLocation] = useState(false);

// Location detection function
const detectLocation = async () => {
  setIsDetectingLocation(true);
  try {
    const { data, error } = await supabase.functions.invoke('detect-location');
    
    if (data?.isVpn) {
      setShowVpnModal(true);
      return;
    }
    
    if (data?.success) {
      if (data.country) setCountry(data.country);
      if (data.state) setState(data.state);
      if (data.city) setCity(data.city);
      toast.success('Location detected successfully');
    }
  } finally {
    setIsDetectingLocation(false);
  }
};
```

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/lib/text-validation.ts` | **Create** | Gibberish detection utility function |
| `src/pages/portal/PortalProfile.tsx` | Modify | Add cropper integration, bio validation, location detection with VPN blocking |
| `src/pages/portal/PortalOnboarding.tsx` | Modify | Add cropper integration, bio validation |
| Database migration | Create | Add DELETE policy for profile-photos bucket |

---

## Technical Details

### Gibberish Detection Algorithm
The algorithm uses multiple heuristics:

```text
Input: "ejhjewgdujwegufhkwrhgergeg"

1. Vowel ratio: 7 vowels / 27 chars = 26% (borderline)
2. Consonant cluster: "wgdj", "wgfhkwrhg" - has 6+ consonants in a row ❌
3. Repeated chars: No
4. Word distribution: Single "word" = unusual ❌

Result: GIBBERISH DETECTED
```

### Image Cropper Flow
```text
1. User clicks "Add Photo"
2. File picker opens
3. User selects image
4. Cropper dialog opens with 1:1 aspect ratio
5. User can zoom, rotate, adjust crop area
6. User clicks "Apply Crop" or "Skip Crop"
7. Image (cropped or original) uploads to storage
8. URL added to avatarUrls array
```

### VPN Detection Integration
```text
PortalProfile Load:
1. Check if location fields are empty
2. If empty, offer "Detect my location" button
3. When clicked, call detect-location edge function
4. If VPN detected → Show VpnBlockedModal (non-dismissable)
5. If location detected → Auto-fill country/state/city
6. User can still manually override
```

---

## Expected Outcomes

1. **Photo uploads work reliably** - DELETE policy allows removing photos
2. **Users can crop photos** - Better quality profile pictures with proper framing
3. **No gibberish bios** - Meaningful content only
4. **Dynamic location** - Auto-detected with VPN protection

---

## Verification Steps

1. **Photo Upload**: Upload a profile photo → should open cropper → crop and save → photo appears
2. **Photo Delete**: Remove a photo → should delete successfully
3. **Gibberish Bio**: Enter "asdkjhaskdjhaskjd" → should show error "Please write a meaningful bio"
4. **Valid Bio**: Enter "I'm a software engineer passionate about building great products" → should pass
5. **Location Detect**: Click detect location → should auto-fill country/state/city
6. **VPN Block**: Connect to VPN, try to detect location → should show VPN modal

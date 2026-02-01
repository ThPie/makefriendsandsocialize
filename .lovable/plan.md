

# Remove TikTok Icon from Footer

## Summary
Remove the TikTok icon and its associated link from the footer's social media section.

## Changes Required

**File: `src/components/layout/Footer.tsx`**

1. **Remove the TikTok link element** (lines 168-176):
   ```tsx
   // DELETE this block:
   <a 
     href="https://tiktok.com" 
     target="_blank" 
     rel="noopener noreferrer"
     className="text-muted-foreground hover:text-primary transition-colors"
     aria-label="TikTok"
   >
     <TikTokIcon className="h-5 w-5" />
   </a>
   ```

2. **Remove the TikTokIcon component definition** (lines 10-14):
   ```tsx
   // DELETE this component:
   const TikTokIcon = ({ className }: { className?: string }) => (
     <svg className={className} viewBox="0 0 24 24" fill="currentColor">
       <path d="M19.59 6.69a4.83..."/>
     </svg>
   );
   ```

## Result
The footer will display only Facebook, Instagram, and LinkedIn social media icons.


import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CORE_VALUES = [
  { id: "honesty", label: "Honesty & Transparency", icon: "🤝" },
  { id: "loyalty", label: "Loyalty & Commitment", icon: "💎" },
  { id: "family", label: "Family & Tradition", icon: "👨‍👩‍👧‍👦" },
  { id: "adventure", label: "Adventure & Spontaneity", icon: "🌍" },
  { id: "ambition", label: "Ambition & Career", icon: "🚀" },
  { id: "kindness", label: "Kindness & Compassion", icon: "💝" },
  { id: "independence", label: "Independence & Freedom", icon: "🦅" },
  { id: "humor", label: "Humor & Playfulness", icon: "😄" },
  { id: "spirituality", label: "Spirituality & Faith", icon: "🙏" },
  { id: "growth", label: "Personal Growth", icon: "📚" },
  { id: "stability", label: "Stability & Security", icon: "🏠" },
  { id: "creativity", label: "Creativity & Expression", icon: "🎨" },
  { id: "health", label: "Health & Wellness", icon: "💪" },
  { id: "connection", label: "Deep Connection", icon: "❤️" },
  { id: "respect", label: "Mutual Respect", icon: "🙌" },
  { id: "communication", label: "Open Communication", icon: "💬" },
  { id: "trust", label: "Trust & Reliability", icon: "🔒" },
  { id: "fun", label: "Fun & Enjoyment", icon: "🎉" },
];

interface SortableValueProps {
  id: string;
  value: typeof CORE_VALUES[0];
  rank: number;
  onRemove: (id: string) => void;
}

function SortableValue({ id, value, rank, onRemove }: SortableValueProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-[hsl(var(--accent-gold))]/20 border-[hsl(var(--accent-gold))] text-[hsl(var(--accent-gold))]";
      case 2:
        return "bg-white/10 border-white/40 text-white/90";
      case 3:
        return "bg-[#A67B5B]/20 border-[#A67B5B] text-[#A67B5B]"; // Bronze/Copper
      default:
        return "bg-white/5 border-white/10 text-white/60";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all text-white",
        getRankColor(rank),
        isDragging && "opacity-50 shadow-lg scale-105 z-50 bg-[#1a231b]"
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none hover:text-white"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 opacity-50 hover:opacity-100" />
      </button>
      <Badge variant="outline" className={cn("font-bold border-current", getRankColor(rank))}>
        #{rank}
      </Badge>
      <span className="text-xl">{value.icon}</span>
      <span className="flex-1 font-medium">{value.label}</span>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface CoreValuesPickerProps {
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  maxSelections?: number;
}

export function CoreValuesPicker({
  selectedValues,
  onValuesChange,
  maxSelections = 5,
}: CoreValuesPickerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const availableValues = CORE_VALUES.filter(
    (v) => !selectedValues.includes(v.id)
  );

  const selectedValueObjects = selectedValues
    .map((id) => CORE_VALUES.find((v) => v.id === id))
    .filter(Boolean) as typeof CORE_VALUES;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedValues.indexOf(active.id as string);
      const newIndex = selectedValues.indexOf(over.id as string);
      onValuesChange(arrayMove(selectedValues, oldIndex, newIndex));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedValues.length < maxSelections) {
      onValuesChange([...selectedValues, id]);
    }
  };

  const handleRemove = (id: string) => {
    onValuesChange(selectedValues.filter((v) => v !== id));
  };

  return (
    <div className="space-y-6">
      {/* Selected Values - Ranked */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white">
            Your Top {maxSelections} Values (Ranked)
          </h4>
          <Badge
            variant={selectedValues.length === maxSelections ? "default" : "outline"}
            className={cn(
              "transition-all",
              selectedValues.length === maxSelections
                ? "bg-[hsl(var(--accent-gold))] text-black hover:bg-[hsl(var(--accent-gold))]/90"
                : "text-white/60 border-white/20"
            )}
          >
            {selectedValues.length}/{maxSelections} selected
          </Badge>
        </div>

        {selectedValues.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-white/10 rounded-lg text-center text-white/40 bg-white/5">
            <p>Click values below to select your top {maxSelections}</p>
            <p className="text-sm mt-1">Then drag to rank by importance</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedValues}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {selectedValueObjects.map((value, index) => (
                  <SortableValue
                    key={value.id}
                    id={value.id}
                    value={value}
                    rank={index + 1}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {selectedValues.length > 0 && selectedValues.length < maxSelections && (
          <p className="text-sm text-white/40 text-center animate-pulse">
            Select {maxSelections - selectedValues.length} more value{maxSelections - selectedValues.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Available Values */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <h4 className="font-semibold text-white">Available Values</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableValues.map((value) => (
            <button
              key={value.id}
              type="button"
              onClick={() => handleSelect(value.id)}
              disabled={selectedValues.length >= maxSelections}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                selectedValues.length >= maxSelections
                  ? "opacity-50 cursor-not-allowed bg-white/5 border-white/5 text-white/20"
                  : "hover:bg-white/10 hover:border-white/30 cursor-pointer border-white/10 bg-white/5 text-white/80 hover:text-white"
              )}
            >
              <span className="text-lg">{value.icon}</span>
              <span className="text-sm font-medium truncate">{value.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

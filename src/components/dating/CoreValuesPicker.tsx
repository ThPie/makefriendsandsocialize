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
        return "bg-yellow-500/20 border-yellow-500 text-yellow-700";
      case 2:
        return "bg-gray-300/30 border-gray-400 text-gray-700";
      case 3:
        return "bg-amber-600/20 border-amber-600 text-amber-700";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
        getRankColor(rank),
        isDragging && "opacity-50 shadow-lg scale-105"
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <Badge variant="outline" className={cn("font-bold", getRankColor(rank))}>
        #{rank}
      </Badge>
      <span className="text-xl">{value.icon}</span>
      <span className="flex-1 font-medium">{value.label}</span>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="p-1 rounded-full hover:bg-destructive/20 transition-colors"
      >
        <X className="h-4 w-4 text-destructive" />
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
          <h4 className="font-semibold text-foreground">
            Your Top {maxSelections} Values (Ranked)
          </h4>
          <Badge
            variant={selectedValues.length === maxSelections ? "default" : "secondary"}
            className="transition-all"
          >
            {selectedValues.length}/{maxSelections} selected
          </Badge>
        </div>

        {selectedValues.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center text-muted-foreground">
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
          <p className="text-sm text-muted-foreground text-center">
            Select {maxSelections - selectedValues.length} more value{maxSelections - selectedValues.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Available Values */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Available Values</h4>
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
                  ? "opacity-50 cursor-not-allowed bg-muted"
                  : "hover:bg-primary/10 hover:border-primary cursor-pointer border-border bg-background"
              )}
            >
              <span className="text-lg">{value.icon}</span>
              <span className="text-sm font-medium truncate">{value.label}</span>
              {selectedValues.length < maxSelections && (
                <Check className="h-4 w-4 ml-auto text-primary opacity-0 group-hover:opacity-100" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

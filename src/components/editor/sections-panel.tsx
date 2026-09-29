"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { SECTION_TYPES, SECTION_META, type SectionType } from "@/lib/resume/schema";
import { BasicsEditor } from "./basics-editor";
import { SectionEditor } from "./section-editor";
import { Card } from "@/components/ui";

export function SectionsPanel() {
  const sections = useEditorStore((s) => s.data.sections);
  const reorderSections = useEditorStore((s) => s.reorderSections);
  const addSection = useEditorStore((s) => s.addSection);
  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      reorderSections(String(active.id), String(over.id));
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <BasicsEditor />
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {sections.map((section) => (
              <SortableSection key={section.id} id={section.id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="relative">
        <button
          onClick={() => setAddOpen((o) => !o)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white py-3 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" /> Add section
        </button>
        {addOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setAddOpen(false)} />
            <div className="absolute bottom-full z-20 mb-2 grid w-full grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {SECTION_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    addSection(t as SectionType);
                    setAddOpen(false);
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  {SECTION_META[t as SectionType].label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SortableSection({ id }: { id: string }) {
  const section = useEditorStore((s) => s.data.sections.find((x) => x.id === id));
  const activeSectionId = useEditorStore((s) => s.activeSectionId);
  const setActiveSection = useEditorStore((s) => s.setActiveSection);
  const toggleSection = useEditorStore((s) => s.toggleSection);
  const removeSection = useEditorStore((s) => s.removeSection);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  if (!section) return null;
  const expanded = activeSectionId === id;
  const count =
    SECTION_META[section.type].kind === "text"
      ? section.text.trim()
        ? 1
        : 0
      : section.items.length;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
        isDragging ? "border-primary opacity-80" : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          className="cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          onClick={() => setActiveSection(expanded ? undefined : id)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className={`font-medium ${section.visible ? "text-slate-900" : "text-slate-400"}`}>
            {section.title || SECTION_META[section.type].defaultTitle}
          </span>
          <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-500">
            {count}
          </span>
        </button>
        <button
          onClick={() => toggleSection(id)}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label={section.visible ? "Hide section" : "Show section"}
          title={section.visible ? "Visible — click to hide" : "Hidden — click to show"}
        >
          {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          onClick={() => {
            if (confirm(`Remove the "${section.title}" section?`)) removeSection(id);
          }}
          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => setActiveSection(expanded ? undefined : id)}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
          aria-label="Expand"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-slate-100 p-4">
          <SectionEditor section={section} />
        </div>
      )}
    </div>
  );
}

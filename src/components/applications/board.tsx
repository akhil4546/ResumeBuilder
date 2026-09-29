"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { APP_STATUSES, STATUS_IDS, type AppStatus, type ApplicationDTO } from "@/lib/applications";
import { moveApplication } from "@/server/actions/application";
import { ApplicationCard } from "./application-card";
import { ApplicationForm } from "./application-form";
import { Button } from "@/components/ui";

type Options = { id: string; title: string }[];
type Columns = Record<AppStatus, ApplicationDTO[]>;

function group(apps: ApplicationDTO[]): Columns {
  const cols = Object.fromEntries(STATUS_IDS.map((s) => [s, [] as ApplicationDTO[]])) as Columns;
  for (const app of apps) cols[app.status]?.push(app);
  for (const s of STATUS_IDS) cols[s].sort((a, b) => a.order - b.order);
  return cols;
}

export function ApplicationBoard({
  initialApps,
  resumeOptions,
  coverLetterOptions,
}: {
  initialApps: ApplicationDTO[];
  resumeOptions: Options;
  coverLetterOptions: Options;
}) {
  const router = useRouter();
  const [columns, setColumns] = useState<Columns>(() => group(initialApps));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null); // status to create in
  const [editing, setEditing] = useState<ApplicationDTO | null>(null);

  const resumeMap = useMemo(
    () => Object.fromEntries(resumeOptions.map((r) => [r.id, r.title])),
    [resumeOptions]
  );
  const coverMap = useMemo(
    () => Object.fromEntries(coverLetterOptions.map((c) => [c.id, c.title])),
    [coverLetterOptions]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const activeApp =
    activeId != null
      ? Object.values(columns).flat().find((a) => a.id === activeId) ?? null
      : null;

  function findContainer(id: string): AppStatus | null {
    if ((STATUS_IDS as string[]).includes(id)) return id as AppStatus;
    return (STATUS_IDS.find((s) => columns[s].some((a) => a.id === id)) as AppStatus) ?? null;
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeCol = findContainer(String(active.id));
    const overCol = findContainer(String(over.id));
    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const activeItems = prev[activeCol];
      const overItems = prev[overCol];
      const activeIndex = activeItems.findIndex((a) => a.id === active.id);
      if (activeIndex === -1) return prev;
      const overIndex = overItems.findIndex((a) => a.id === over.id);
      const insertAt =
        (STATUS_IDS as string[]).includes(String(over.id)) || overIndex === -1
          ? overItems.length
          : overIndex;
      const moved = { ...activeItems[activeIndex], status: overCol };
      return {
        ...prev,
        [activeCol]: activeItems.filter((a) => a.id !== active.id),
        [overCol]: [...overItems.slice(0, insertAt), moved, ...overItems.slice(insertAt)],
      };
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const overCol = findContainer(String(over.id));
    if (!overCol) return;

    setColumns((prev) => {
      const items = prev[overCol];
      const oldIndex = items.findIndex((a) => a.id === active.id);
      if (oldIndex === -1) return prev;
      const overIndex = (STATUS_IDS as string[]).includes(String(over.id))
        ? items.length - 1
        : items.findIndex((a) => a.id === over.id);
      const reordered = arrayMove(items, oldIndex, overIndex < 0 ? items.length - 1 : overIndex);
      const orderedIds = reordered.map((a) => a.id);
      moveApplication(String(active.id), overCol, orderedIds).catch(() => router.refresh());
      return { ...prev, [overCol]: reordered };
    });
  }

  const total = STATUS_IDS.reduce((n, s) => n + columns[s].length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="mt-1 text-sm text-slate-600">
            {total === 0 ? "Track every job you apply to." : `${total} tracked`}
          </p>
        </div>
        <Button onClick={() => setCreating("SAVED")}>
          <Plus className="h-4 w-4" /> Add application
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {APP_STATUSES.map((col) => (
            <Column
              key={col.id}
              status={col.id}
              label={col.label}
              dot={col.dot}
              bg={col.bg}
              items={columns[col.id]}
              resumeMap={resumeMap}
              coverMap={coverMap}
              onAdd={() => setCreating(col.id)}
              onEdit={(app) => setEditing(app)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApp ? (
            <ApplicationCard
              app={activeApp}
              resumeTitle={activeApp.resumeId ? resumeMap[activeApp.resumeId] : undefined}
              coverTitle={activeApp.coverLetterId ? coverMap[activeApp.coverLetterId] : undefined}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {creating && (
        <ApplicationForm
          defaultStatus={creating}
          resumeOptions={resumeOptions}
          coverLetterOptions={coverLetterOptions}
          onClose={() => setCreating(null)}
        />
      )}
      {editing && (
        <ApplicationForm
          initial={editing}
          resumeOptions={resumeOptions}
          coverLetterOptions={coverLetterOptions}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function Column({
  status,
  label,
  dot,
  bg,
  items,
  resumeMap,
  coverMap,
  onAdd,
  onEdit,
}: {
  status: AppStatus;
  label: string;
  dot: string;
  bg: string;
  items: ApplicationDTO[];
  resumeMap: Record<string, string>;
  coverMap: Record<string, string>;
  onAdd: () => void;
  onEdit: (app: ApplicationDTO) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`flex flex-col rounded-xl ${bg} p-2`}>
      <div className="mb-2 flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          {label}
          <span className="rounded-full bg-white/70 px-1.5 text-xs text-slate-500">{items.length}</span>
        </div>
        <button
          onClick={onAdd}
          className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
          aria-label={`Add to ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`scroll-thin flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-1 transition-colors ${
          isOver ? "bg-white/60" : ""
        }`}
      >
        <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {items.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              resumeTitle={app.resumeId ? resumeMap[app.resumeId] : undefined}
              coverTitle={app.coverLetterId ? coverMap[app.coverLetterId] : undefined}
              onEdit={() => onEdit(app)}
            />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <button
            onClick={onAdd}
            className="rounded-lg border border-dashed border-slate-300 py-4 text-xs text-slate-400 hover:border-primary hover:text-primary"
          >
            Add here
          </button>
        )}
      </div>
    </div>
  );
}

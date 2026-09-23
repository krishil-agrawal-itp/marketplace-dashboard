"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import type {
  DailyProgressEntry,
  ProgressStatus,
  ProgressUpdate,
} from "@/lib/types";
import { formatDate } from "@/lib/status";
import { cn } from "@/lib/utils";

const statusStyles: Record<ProgressStatus, string> = {
  on_track: "bg-success-soft text-success",
  at_risk: "bg-error-soft text-error",
  blocked: "bg-error-soft text-error",
  delayed: "bg-warning-soft text-warning",
  completed: "bg-surface-secondary text-text-secondary",
};

const statusLabels: Record<ProgressStatus, string> = {
  on_track: "On track",
  at_risk: "At risk",
  blocked: "Blocked",
  delayed: "Delayed",
  completed: "Completed",
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:border-border-strong focus:outline-none";
const areaClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-border-strong focus:outline-none";

type ProjectForm = {
  title: string;
  owner: string;
  team: string;
  productId: string;
  marketplaceId: string;
  progressPct: string;
  status: ProgressStatus;
  eta: string;
  updateNotes: string;
  wip: string;
  nextMilestone: string;
  blockers: string;
};

type DailyForm = {
  date: string;
  author: string;
  notes: string;
  progressPct: string;
  hoursSpent: string;
  accomplishments: string;
  tomorrowPlan: string;
};

const emptyProjectForm: ProjectForm = {
  title: "",
  owner: "",
  team: "",
  productId: "",
  marketplaceId: "",
  progressPct: "0",
  status: "on_track",
  eta: "",
  updateNotes: "",
  wip: "",
  nextMilestone: "",
  blockers: "",
};

function emptyDailyForm(owner: string, progressPct: number): DailyForm {
  return {
    date: new Date().toISOString().slice(0, 10),
    author: owner,
    notes: "",
    progressPct: String(progressPct),
    hoursSpent: "",
    accomplishments: "",
    tomorrowPlan: "",
  };
}

export function ProgressUpdatesSection({
  initialUpdates,
  initialDailyEntries,
  products,
  marketplaces,
}: {
  initialUpdates: ProgressUpdate[];
  initialDailyEntries: DailyProgressEntry[];
  products: { id: string; name: string }[];
  marketplaces: { id: string; name: string }[];
}) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [dailyEntries, setDailyEntries] = useState(initialDailyEntries);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProjectForm);
  const [dailyForm, setDailyForm] = useState<DailyForm>(emptyDailyForm("", 0));
  const [statusFilter, setStatusFilter] = useState<ProgressStatus | "all">(
    "all",
  );
  const [teamFilter, setTeamFilter] = useState("");

  const selected = updates.find((u) => u.id === selectedId) ?? null;

  const teams = useMemo(
    () => [...new Set(updates.map((u) => u.team))].sort(),
    [updates],
  );

  const filtered = useMemo(() => {
    return updates.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (teamFilter && u.team !== teamFilter) return false;
      return true;
    });
  }, [updates, statusFilter, teamFilter]);

  const summary = useMemo(() => {
    const active = updates.filter((u) => u.status !== "completed");
    return {
      total: updates.length,
      onTrack: updates.filter((u) => u.status === "on_track").length,
      attention: updates.filter((u) =>
        ["at_risk", "blocked", "delayed"].includes(u.status),
      ).length,
      avgProgress:
        active.length === 0
          ? 0
          : Math.round(
              active.reduce((s, u) => s + u.progressPct, 0) / active.length,
            ),
    };
  }, [updates]);

  const selectedDailies = useMemo(() => {
    if (!selectedId) return [];
    return dailyEntries
      .filter((d) => d.progressUpdateId === selectedId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyEntries, selectedId]);

  function openDailyModal() {
    if (!selected) return;
    setDailyForm(emptyDailyForm(selected.owner, selected.progressPct));
    setDailyModalOpen(true);
  }

  function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectForm.title.trim() || !projectForm.owner.trim() || !projectForm.eta)
      return;

    const today = new Date().toISOString().slice(0, 10);
    const next: ProgressUpdate = {
      id: `prog-${Date.now()}`,
      title: projectForm.title.trim(),
      owner: projectForm.owner.trim(),
      team: projectForm.team.trim() || "Unassigned",
      productId: projectForm.productId || null,
      marketplaceId: projectForm.marketplaceId || null,
      progressPct: clampPct(projectForm.progressPct),
      status: projectForm.status,
      eta: projectForm.eta,
      lastUpdateAt: today,
      updateNotes: projectForm.updateNotes.trim() || "Initial update logged.",
      wip: projectForm.wip.trim() || "—",
      nextMilestone: projectForm.nextMilestone.trim() || "—",
      blockers: projectForm.blockers.trim() || "None",
    };

    setUpdates((prev) => [next, ...prev]);
    setProjectForm(emptyProjectForm);
    setProjectModalOpen(false);
    setSelectedId(next.id);
  }

  function handleDailySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !dailyForm.notes.trim() || !dailyForm.date) return;

    const pct = clampPct(dailyForm.progressPct);
    const entry: DailyProgressEntry = {
      id: `daily-${Date.now()}`,
      progressUpdateId: selected.id,
      date: dailyForm.date,
      author: dailyForm.author.trim() || selected.owner,
      notes: dailyForm.notes.trim(),
      progressPct: pct,
      hoursSpent: dailyForm.hoursSpent
        ? Number.parseFloat(dailyForm.hoursSpent)
        : null,
      accomplishments: dailyForm.accomplishments.trim() || "—",
      tomorrowPlan: dailyForm.tomorrowPlan.trim() || "—",
    };

    setDailyEntries((prev) => [entry, ...prev]);
    setUpdates((prev) =>
      prev.map((u) =>
        u.id === selected.id
          ? {
              ...u,
              progressPct: pct,
              lastUpdateAt: dailyForm.date,
              updateNotes: dailyForm.notes.trim(),
            }
          : u,
      ),
    );
    setDailyModalOpen(false);
  }

  if (selected) {
    const product = products.find((p) => p.id === selected.productId);
    const marketplace = marketplaces.find(
      (m) => m.id === selected.marketplaceId,
    );

    return (
      <section id="progress" className="scroll-mt-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="type-body mb-2 inline-flex items-center gap-1.5 font-medium text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="size-4" />
              All progress items
            </button>
            <h2 className="type-heading">{selected.title}</h2>
            <p className="type-subtitle mt-1">
              {selected.owner} · {selected.team}
              {product ? ` · ${product.name}` : ""}
              {marketplace ? ` · ${marketplace.name}` : ""}
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={openDailyModal}>
            <Plus className="size-4" />
            Add daily progress
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="panel-pad lg:col-span-1">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span
                className={cn(
                  "type-caption inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 font-semibold",
                  statusStyles[selected.status],
                )}
              >
                {statusLabels[selected.status]}
              </span>
              <span className="type-caption">
                ETA {formatDate(selected.eta)}
              </span>
            </div>
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="type-caption">Progress</span>
                <span className="type-caption font-semibold tabular-nums">
                  {selected.progressPct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                <div
                  className="h-full rounded-full bg-zinc-900"
                  style={{ width: `${selected.progressPct}%` }}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Field label="Latest update" value={selected.updateNotes} />
              <Field label="WIP" value={selected.wip} />
              <Field label="Next milestone" value={selected.nextMilestone} />
              <Field label="Blockers" value={selected.blockers} />
              <Field
                label="Last update date"
                value={formatDate(selected.lastUpdateAt)}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="type-heading mb-3">Daily progress log</h3>
            {selectedDailies.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
                <p className="type-caption">
                  No daily entries yet. Add the first update for this project.
                </p>
                <button
                  type="button"
                  className="btn-primary mt-4"
                  onClick={openDailyModal}
                >
                  <Plus className="size-4" />
                  Add daily progress
                </button>
              </div>
            ) : (
              <ol className="space-y-3">
                {selectedDailies.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-2xl border border-border bg-surface p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="type-body font-semibold">
                          {formatDate(entry.date)}
                        </p>
                        <p className="type-caption mt-0.5">
                          {entry.author}
                          {entry.hoursSpent != null
                            ? ` · ${entry.hoursSpent}h`
                            : ""}
                        </p>
                      </div>
                      <span className="type-caption font-semibold tabular-nums">
                        {entry.progressPct}% complete
                      </span>
                    </div>
                    <p className="type-body mt-3">{entry.notes}</p>
                    <div className="mt-3 grid gap-3 border-t border-divider pt-3 sm:grid-cols-2">
                      <Field
                        label="Accomplishments"
                        value={entry.accomplishments}
                      />
                      <Field label="Tomorrow" value={entry.tomorrowPlan} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {dailyModalOpen ? (
          <Modal
            title="Add daily progress"
            subtitle={`Log today’s work for “${selected.title}”.`}
            onClose={() => setDailyModalOpen(false)}
          >
            <form onSubmit={handleDailySubmit} className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="type-label">Date</span>
                <input
                  required
                  type="date"
                  className={inputClass}
                  value={dailyForm.date}
                  onChange={(e) =>
                    setDailyForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="type-label">Author</span>
                <input
                  required
                  className={inputClass}
                  value={dailyForm.author}
                  onChange={(e) =>
                    setDailyForm((f) => ({ ...f, author: e.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="type-label">Progress % after today</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={inputClass}
                  value={dailyForm.progressPct}
                  onChange={(e) =>
                    setDailyForm((f) => ({
                      ...f,
                      progressPct: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="type-label">Hours spent</span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  className={inputClass}
                  value={dailyForm.hoursSpent}
                  onChange={(e) =>
                    setDailyForm((f) => ({
                      ...f,
                      hoursSpent: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="type-label">What did you do today?</span>
                <textarea
                  required
                  rows={3}
                  className={areaClass}
                  value={dailyForm.notes}
                  onChange={(e) =>
                    setDailyForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="type-label">Accomplishments</span>
                <textarea
                  rows={2}
                  className={areaClass}
                  value={dailyForm.accomplishments}
                  onChange={(e) =>
                    setDailyForm((f) => ({
                      ...f,
                      accomplishments: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="type-label">Plan for tomorrow</span>
                <textarea
                  rows={2}
                  className={areaClass}
                  value={dailyForm.tomorrowPlan}
                  onChange={(e) =>
                    setDailyForm((f) => ({
                      ...f,
                      tomorrowPlan: e.target.value,
                    }))
                  }
                />
              </label>
              <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setDailyModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus className="size-4" />
                  Save daily update
                </button>
              </div>
            </form>
          </Modal>
        ) : null}
      </section>
    );
  }

  return (
    <section id="progress" className="scroll-mt-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">Team progress & updates</h2>
          <p className="type-subtitle mt-1">
            Click a project to view and add daily progress. Track ETAs, WIP, and
            blockers from marketplace deployment owners.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setProjectModalOpen(true)}
        >
          <Plus className="size-4" />
          Add project
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Active updates" value={String(summary.total)} />
        <SummaryTile label="On track" value={String(summary.onTrack)} />
        <SummaryTile label="Needs attention" value={String(summary.attention)} />
        <SummaryTile label="Avg progress" value={`${summary.avgProgress}%`} />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1">
          <span className="type-label">Status</span>
          <select
            className={cn(inputClass, "w-[160px]")}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ProgressStatus | "all")
            }
          >
            <option value="all">All</option>
            {(Object.keys(statusLabels) as ProgressStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="type-label">Team</span>
          <select
            className={cn(inputClass, "w-[200px]")}
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          const marketplace = marketplaces.find(
            (m) => m.id === item.marketplaceId,
          );
          const dayCount = dailyEntries.filter(
            (d) => d.progressUpdateId === item.id,
          ).length;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-left transition-all duration-150 hover:border-border-strong hover:shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="type-heading">{item.title}</h3>
                  <p className="type-caption mt-1">
                    {item.owner} · {item.team}
                    {product ? ` · ${product.name}` : ""}
                    {marketplace ? ` · ${marketplace.name}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "type-caption inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 font-semibold",
                    statusStyles[item.status],
                  )}
                >
                  {statusLabels[item.status]}
                </span>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="type-caption">Progress</span>
                  <span className="type-caption font-semibold tabular-nums">
                    {item.progressPct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className="h-full rounded-full bg-zinc-900"
                    style={{ width: `${item.progressPct}%` }}
                  />
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-3">
                <div>
                  <dt className="type-caption">ETA</dt>
                  <dd className="type-body mt-0.5 font-semibold">
                    {formatDate(item.eta)}
                  </dd>
                </div>
                <div>
                  <dt className="type-caption">Updated</dt>
                  <dd className="type-body mt-0.5 font-semibold">
                    {formatDate(item.lastUpdateAt)}
                  </dd>
                </div>
                <div>
                  <dt className="type-caption">Daily logs</dt>
                  <dd className="type-body mt-0.5 font-semibold tabular-nums">
                    {dayCount}
                  </dd>
                </div>
              </dl>

              <p className="type-caption line-clamp-2 border-t border-divider pt-3">
                {item.updateNotes}
              </p>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="type-caption py-8 text-center">
          No progress updates match these filters.
        </p>
      ) : null}

      {projectModalOpen ? (
        <Modal
          title="Add project"
          subtitle="Create a marketplace deployment workstream to track ETAs and daily progress."
          onClose={() => setProjectModalOpen(false)}
        >
          <form
            onSubmit={handleProjectSubmit}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="type-label">Title</span>
              <input
                required
                className={inputClass}
                value={projectForm.title}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. GitHub Agent AWS listing"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="type-label">Owner</span>
              <input
                required
                className={inputClass}
                value={projectForm.owner}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, owner: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="type-label">Team</span>
              <input
                className={inputClass}
                value={projectForm.team}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, team: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="type-label">Product</span>
              <select
                className={inputClass}
                value={projectForm.productId}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, productId: e.target.value }))
                }
              >
                <option value="">None</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="type-label">Marketplace</span>
              <select
                className={inputClass}
                value={projectForm.marketplaceId}
                onChange={(e) =>
                  setProjectForm((f) => ({
                    ...f,
                    marketplaceId: e.target.value,
                  }))
                }
              >
                <option value="">None</option>
                {marketplaces.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="type-label">Progress %</span>
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={projectForm.progressPct}
                onChange={(e) =>
                  setProjectForm((f) => ({
                    ...f,
                    progressPct: e.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="type-label">Status</span>
              <select
                className={inputClass}
                value={projectForm.status}
                onChange={(e) =>
                  setProjectForm((f) => ({
                    ...f,
                    status: e.target.value as ProgressStatus,
                  }))
                }
              >
                {(Object.keys(statusLabels) as ProgressStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="type-label">ETA</span>
              <input
                required
                type="date"
                className={inputClass}
                value={projectForm.eta}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, eta: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="type-label">Latest update</span>
              <textarea
                rows={2}
                className={areaClass}
                value={projectForm.updateNotes}
                onChange={(e) =>
                  setProjectForm((f) => ({
                    ...f,
                    updateNotes: e.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="type-label">WIP</span>
              <textarea
                rows={2}
                className={areaClass}
                value={projectForm.wip}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, wip: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="type-label">Next milestone</span>
              <input
                className={inputClass}
                value={projectForm.nextMilestone}
                onChange={(e) =>
                  setProjectForm((f) => ({
                    ...f,
                    nextMilestone: e.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="type-label">Blockers</span>
              <input
                className={inputClass}
                value={projectForm.blockers}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, blockers: e.target.value }))
                }
              />
            </label>
            <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setProjectModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Plus className="size-4" />
                Save project
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

function clampPct(value: string): number {
  return Math.min(100, Math.max(0, Number.parseInt(value, 10) || 0));
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="type-caption">{label}</p>
      <p className="type-metric mt-1 tabular-nums">{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="type-caption">{label}</p>
      <p className="type-body mt-0.5">{value}</p>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="type-heading">{title}</h3>
            <p className="type-subtitle mt-1">{subtitle}</p>
          </div>
          <button
            type="button"
            className="btn-secondary size-9 justify-center px-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

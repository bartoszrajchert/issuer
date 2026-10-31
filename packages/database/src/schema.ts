import {
  PRIORITY,
  STATUS_TYPE,
  type Priority,
  type StatusType,
} from '@issuer/shared';
import { defineRelations, sql } from 'drizzle-orm';
import {
  check,
  doublePrecision,
  foreignKey,
  index,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const timestampHelper = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()), // Updates only when using Drizzle
};

export const issues = pgTable(
  'issues',
  {
    id: uuid().primaryKey(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    priority: smallint().$type<Priority>().notNull().default(PRIORITY.NONE),
    teamId: uuid()
      .notNull()
      .references(() => teams.id, { onDelete: 'restrict' }), // We want to make sure that issues are not deleted when a team is deleted
    creatorId: uuid()
      .notNull()
      .references(() => users.id),
    statusId: uuid().notNull(),
    assigneeId: uuid().references(() => users.id, { onDelete: 'set null' }),
    archivedAt: timestamp({ withTimezone: true }), // We want to archive issues instead of deleting them (good for local-first)
    ...timestampHelper,
  },
  (t) => [
    check('issues_priority_range', sql`${t.priority} BETWEEN 0 AND 4`),
    foreignKey({
      name: 'issues_status_same_team_fk',
      columns: [t.teamId, t.statusId],
      foreignColumns: [statuses.teamId, statuses.id],
    }).onDelete('restrict'), // .references(...) on statusId not needed
    index('issues_team_status_id_idx').on(t.teamId, t.statusId), // team and status are often queried together, and we want to sort records by teams and then by status
    index('issues_creator_id_idx').on(t.creatorId),
    index('issues_assignee_id_idx').on(t.assigneeId),
  ],
);

export const statuses = pgTable(
  'statuses',
  {
    id: uuid().primaryKey(),
    name: varchar({ length: 24 }).notNull(),
    teamId: uuid()
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    position: doublePrecision().notNull().default(0), // doublePrecision is used here because we want to be able to insert statuses between other statuses (e.g. 1.5 between 1 and 2)
    type: smallint().$type<StatusType>().notNull().default(STATUS_TYPE.BACKLOG),
    ...timestampHelper,
  },
  (t) => [
    // index("statuses_team_id_idx").on(t.teamId), - not needed because we have a unique constraint on teamId and id
    unique('statuses_team_id_id_unique').on(t.teamId, t.id),
    unique('statuses_team_id_name_unique').on(t.teamId, t.name), // unique("statuses_name_unique").on(t.name) is same as .unique on column
    check('statuses_type_check', sql`${t.type} BETWEEN 0 AND 4`),
  ],
);

export const teams = pgTable('teams', {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  ...timestampHelper,
});

export const users = pgTable('users', {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  ...timestampHelper,
});

export const comments = pgTable(
  'comments',
  {
    id: uuid().primaryKey(),
    content: text().notNull(),
    ownerId: uuid().references(() => users.id, { onDelete: 'set null' }),
    issueId: uuid()
      .notNull()
      .references(() => issues.id, { onDelete: 'cascade' }),
    ...timestampHelper,
  },
  (t) => [
    index('comments_owner_id_idx').on(t.ownerId),
    index('comments_issue_id_idx').on(t.issueId),
  ],
);

export const labels = pgTable('labels', {
  id: uuid().primaryKey(),
  name: varchar({ length: 24 }).notNull(),
  ...timestampHelper,
});

export const labelsToIssues = pgTable(
  'labels_to_issues',
  {
    labelId: uuid()
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
    issueId: uuid()
      .notNull()
      .references(() => issues.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.issueId, t.labelId] }),
    index('labels_to_issues_label_id_idx').on(t.labelId),
  ],
);

export const usersToTeams = pgTable(
  'users_to_teams',
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    teamId: uuid()
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.teamId, t.userId] }),
    index('users_to_teams_user_id_idx').on(t.userId),
  ],
);

const REL = { creator: 'creator', assignee: 'assignee' } as const;
export const relations = defineRelations(
  {
    users,
    comments,
    teams,
    issues,
    statuses,
    labelsToIssues,
    labels,
    usersToTeams,
  },
  (r) => ({
    teams: {
      members: r.many.users({
        from: r.teams.id.through(r.usersToTeams.teamId),
        to: r.users.id.through(r.usersToTeams.userId),
      }),
      issues: r.many.issues(),
      statuses: r.many.statuses(),
    },
    comments: {
      author: r.one.users({
        from: r.comments.ownerId,
        to: r.users.id,
      }),
      issue: r.one.issues({
        from: r.comments.issueId,
        to: r.issues.id,
        optional: false,
      }),
    },
    users: {
      comments: r.many.comments(),
      teams: r.many.teams(),
      createdIssues: r.many.issues({
        alias: REL.creator,
      }),
      assignedIssues: r.many.issues({
        alias: REL.assignee,
      }),
    },
    issues: {
      labels: r.many.labels({
        from: r.issues.id.through(r.labelsToIssues.issueId),
        to: r.labels.id.through(r.labelsToIssues.labelId),
      }),
      team: r.one.teams({
        from: r.issues.teamId,
        to: r.teams.id,
        optional: false,
      }),
      creator: r.one.users({
        from: r.issues.creatorId,
        to: r.users.id,
        alias: REL.creator,
        optional: false,
      }),
      assignee: r.one.users({
        from: r.issues.assigneeId,
        to: r.users.id,
        alias: REL.assignee,
      }),
      status: r.one.statuses({
        from: r.issues.statusId,
        to: r.statuses.id,
        optional: false,
      }),
      comments: r.many.comments(),
    },
    statuses: {
      team: r.one.teams({
        from: r.statuses.teamId,
        to: r.teams.id,
        optional: false,
      }),
    },
    labels: {
      issues: r.many.issues(),
    },
  }),
);

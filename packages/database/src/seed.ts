import "dotenv/config";

import { v7 as uuidv7 } from "uuid";
import { STATUS_TYPE } from "@issuer/shared";
import {
  comments,
  issues,
  labels,
  labelsToIssues,
  teams,
  users,
  usersToTeams,
  statuses,
  relations,
} from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import type { Priority } from "@issuer/shared";

const TEAMS = ["Frontend", "Backend", "Platform"];
const LABELS = [
  "bug",
  "feature",
  "ui",
  "api",
  "perf",
  "docs",
  "security",
  "tech-debt",
];
const USER_COUNT = 20;
const ISSUES_PER_TEAM = 100;

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(arr: readonly T[]): T => arr[rand(arr.length)]!;
const shuffle = <T>(arr: readonly T[]) =>
  [...arr].sort(() => Math.random() - 0.5);
const chunk = <T>(arr: T[], size = 1000) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, (i + 1) * size),
  );

const db = drizzle(process.env.DATABASE_URL!, { relations: { ...relations } });

export function defaultStatuses(
  teamId: string,
): (typeof statuses.$inferInsert)[] {
  return [
    { name: "Backlog", type: STATUS_TYPE.BACKLOG },
    { name: "Todo", type: STATUS_TYPE.UNSTARTED },
    { name: "In Progress", type: STATUS_TYPE.STARTED },
    { name: "Done", type: STATUS_TYPE.COMPLETED },
    { name: "Canceled", type: STATUS_TYPE.CANCELED },
  ].map((s, i) => ({ id: uuidv7(), teamId, position: i + 1, ...s }));
}

export async function seed() {
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`TRUNCATE teams, users, labels, statuses, issues, comments, labels_to_issues, users_to_teams CASCADE`,
    );

    const teamRows = TEAMS.map((name) => ({ id: uuidv7(), name }));
    const userRows = Array.from({ length: USER_COUNT }, (_, i) => ({
      id: uuidv7(),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
    }));
    const labelRows = LABELS.map((name) => ({ id: uuidv7(), name }));
    const statusRows = teamRows.flatMap((team) => defaultStatuses(team.id));

    const membershipRows = userRows.flatMap((u, i) => {
      const teamIds = new Set([teamRows[i % teamRows.length]!.id]);
      if (Math.random() < 0.3) teamIds.add(pick(teamRows).id);
      return [...teamIds].map((teamId) => ({ userId: u.id, teamId }));
    });

    const membersByTeam = new Map(
      teamRows.map((t) => [
        t.id,
        membershipRows.filter((m) => m.teamId === t.id).map((m) => m.userId),
      ]),
    );
    const statusesByTeam = new Map(
      teamRows.map((t) => [t.id, statusRows.filter((s) => s.teamId === t.id)]),
    );

    const issueRows = teamRows.flatMap((team) => {
      const members = membersByTeam.get(team.id)!;
      const teamStatuses = statusesByTeam.get(team.id)!;
      return Array.from({ length: ISSUES_PER_TEAM }, (_, i) => ({
        id: uuidv7(),
        teamId: team.id,
        statusId: pick(teamStatuses).id,
        creatorId: pick(members),
        assigneeId: Math.random() < 0.8 ? pick(members) : null,
        title: `${team.name} Issue #${i + 1}`,
        priority: rand(5) as Priority,
      }));
    });

    const issueLabelRows = issueRows.flatMap((issue) =>
      shuffle(labelRows)
        .slice(0, rand(3))
        .map((label) => ({
          issueId: issue.id,
          labelId: label.id,
        })),
    );

    const commentRows = issueRows.flatMap((issue) => {
      const members = membersByTeam.get(issue.teamId)!;
      return Array.from({ length: rand(4) }, (_, i) => ({
        id: uuidv7(),
        issueId: issue.id,
        ownerId: pick(members),
        content: `Comment ${i + 1}`,
      }));
    });

    await tx.insert(teams).values(teamRows);
    await tx.insert(users).values(userRows);
    await tx.insert(labels).values(labelRows);
    await tx.insert(statuses).values(statusRows);
    await tx.insert(usersToTeams).values(membershipRows);

    // Chunks keep each INSERT under Postgres' 65,535 bind-parameter limit.
    for (const part of chunk(issueRows)) await tx.insert(issues).values(part);
    for (const part of chunk(issueLabelRows))
      await tx.insert(labelsToIssues).values(part);
    for (const part of chunk(commentRows))
      await tx.insert(comments).values(part);

    console.log(
      `Seeded ${teamRows.length} teams, ${userRows.length} users, ${statusRows.length} statuses, ` +
        `${issueRows.length} issues, ${issueLabelRows.length} issue labels, ${commentRows.length} comments`,
    );
  });

  await db.execute(sql`ANALYZE`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());

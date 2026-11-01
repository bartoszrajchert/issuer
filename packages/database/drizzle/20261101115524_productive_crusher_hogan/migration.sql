CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY,
	"content" text NOT NULL,
	"ownerId" uuid,
	"issueId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" smallint DEFAULT 0 NOT NULL,
	"teamId" uuid NOT NULL,
	"creatorId" uuid NOT NULL,
	"statusId" uuid NOT NULL,
	"assigneeId" uuid,
	"archivedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issues_priority_range" CHECK ("priority" BETWEEN 0 AND 4)
);
--> statement-breakpoint
CREATE TABLE "labels" (
	"id" uuid PRIMARY KEY,
	"name" varchar(24) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labels_to_issues" (
	"labelId" uuid,
	"issueId" uuid,
	CONSTRAINT "labels_to_issues_pkey" PRIMARY KEY("issueId","labelId")
);
--> statement-breakpoint
CREATE TABLE "statuses" (
	"id" uuid PRIMARY KEY,
	"name" varchar(24) NOT NULL,
	"teamId" uuid NOT NULL,
	"position" double precision DEFAULT 0 NOT NULL,
	"type" smallint DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "statuses_team_id_id_unique" UNIQUE("teamId","id"),
	CONSTRAINT "statuses_team_id_name_unique" UNIQUE("teamId","name"),
	CONSTRAINT "statuses_type_check" CHECK ("type" BETWEEN 0 AND 4)
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255) NOT NULL UNIQUE,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_to_teams" (
	"userId" uuid,
	"teamId" uuid,
	CONSTRAINT "users_to_teams_pkey" PRIMARY KEY("teamId","userId")
);
--> statement-breakpoint
CREATE INDEX "comments_owner_id_idx" ON "comments" ("ownerId");--> statement-breakpoint
CREATE INDEX "comments_issue_id_idx" ON "comments" ("issueId");--> statement-breakpoint
CREATE INDEX "issues_team_status_id_idx" ON "issues" ("teamId","statusId");--> statement-breakpoint
CREATE INDEX "issues_creator_id_idx" ON "issues" ("creatorId");--> statement-breakpoint
CREATE INDEX "issues_assignee_id_idx" ON "issues" ("assigneeId");--> statement-breakpoint
CREATE INDEX "labels_to_issues_label_id_idx" ON "labels_to_issues" ("labelId");--> statement-breakpoint
CREATE INDEX "users_to_teams_user_id_idx" ON "users_to_teams" ("userId");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_ownerId_users_id_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_issueId_issues_id_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_teamId_teams_id_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_creatorId_users_id_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_assigneeId_users_id_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_status_same_team_fk" FOREIGN KEY ("teamId","statusId") REFERENCES "statuses"("teamId","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "labels_to_issues" ADD CONSTRAINT "labels_to_issues_labelId_labels_id_fkey" FOREIGN KEY ("labelId") REFERENCES "labels"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "labels_to_issues" ADD CONSTRAINT "labels_to_issues_issueId_issues_id_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_teamId_teams_id_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_teamId_teams_id_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE;
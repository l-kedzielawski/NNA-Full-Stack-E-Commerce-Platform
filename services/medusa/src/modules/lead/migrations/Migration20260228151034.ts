import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260228151034 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "lead" ("id" text not null, "name" text not null, "company" text null, "email" text not null, "phone" text null, "country" text null, "product" text null, "quantity" text null, "message" text null, "consent" boolean not null default false, "ip" text null, "user_agent" text null, "status" text not null default 'new', "priority" text not null default 'normal', "assignee" text null, "notes" text null, "source" text not null default 'quote_form', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "lead_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_lead_deleted_at" ON "lead" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "lead" cascade;`);
  }

}

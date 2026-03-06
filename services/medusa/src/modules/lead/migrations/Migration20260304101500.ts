import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260304101500 extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table if exists "lead" add column if not exists "payment_link_url" text null;');
    this.addSql('alter table if exists "lead" add column if not exists "payment_link_session_id" text null;');
    this.addSql('alter table if exists "lead" add column if not exists "payment_link_expires_at" timestamptz null;');
    this.addSql('alter table if exists "lead" add column if not exists "payment_status" text null;');
    this.addSql('alter table if exists "lead" add column if not exists "payment_amount" numeric null;');
    this.addSql('alter table if exists "lead" add column if not exists "payment_currency" text null;');
    this.addSql('alter table if exists "lead" add column if not exists "payment_created_at" timestamptz null;');
    this.addSql('alter table if exists "lead" add column if not exists "payment_paid_at" timestamptz null;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table if exists "lead" drop column if exists "payment_paid_at";');
    this.addSql('alter table if exists "lead" drop column if exists "payment_created_at";');
    this.addSql('alter table if exists "lead" drop column if exists "payment_currency";');
    this.addSql('alter table if exists "lead" drop column if exists "payment_amount";');
    this.addSql('alter table if exists "lead" drop column if exists "payment_status";');
    this.addSql('alter table if exists "lead" drop column if exists "payment_link_expires_at";');
    this.addSql('alter table if exists "lead" drop column if exists "payment_link_session_id";');
    this.addSql('alter table if exists "lead" drop column if exists "payment_link_url";');
  }
}

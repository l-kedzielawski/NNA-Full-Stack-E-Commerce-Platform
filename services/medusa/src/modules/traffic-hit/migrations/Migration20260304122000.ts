import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260304122000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'create table if not exists "traffic_hit" ("id" text not null, "path" text not null, "locale" text null, "referrer_domain" text null, "device_category" text null, "country_code" text null, "source" text not null default \'storefront\', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "traffic_hit_pkey" primary key ("id"));',
    );
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_traffic_hit_deleted_at" ON "traffic_hit" ("deleted_at") WHERE deleted_at IS NULL;');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_traffic_hit_created_at" ON "traffic_hit" ("created_at");');
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "traffic_hit" cascade;');
  }
}

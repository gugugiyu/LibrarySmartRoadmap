import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1761360443587 implements MigrationInterface {
    name = 'Init1761360443587';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."roadmap_prompts_self_assessment_level_enum" AS ENUM('expert', 'highly_proficient', 'advanced', 'intermediate', 'beginners')`,
        );
        await queryRunner.query(
            `CREATE TABLE "roadmap_prompts" ("id" SERIAL NOT NULL, "major" character varying(100) NOT NULL, "background" text NOT NULL, "self_assessment_level" "public"."roadmap_prompts_self_assessment_level_enum" NOT NULL DEFAULT 'beginners', "daily_study_hours" double precision NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "modified_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, CONSTRAINT "PK_cd54ada6d6fe7e4d36f91ca77f3" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "roadmaps" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "modified_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "promptId" integer NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "REL_84ef4e7cf44ea46fa4fb1127c7" UNIQUE ("promptId"), CONSTRAINT "PK_9b0d527f9c64d15405c21e7ca54" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "roadmap_nodes" ("id" SERIAL NOT NULL, "order" integer NOT NULL, "title" character varying(255), "goal" text, "keywords" text, "is_completed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "modified_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "roadmapId" integer NOT NULL, "parentId" integer, "infoId" integer, CONSTRAINT "PK_428aeada0f36f851e12933c1efd" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "roadmap_prompts_has_previously_read_textual_information" ("roadmapPromptsId" integer NOT NULL, "textualInformationId" integer NOT NULL, CONSTRAINT "PK_50a65241c2f5b21ead56fcfd95e" PRIMARY KEY ("roadmapPromptsId", "textualInformationId"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_dde081c076609e36e3fbb8c6af" ON "roadmap_prompts_has_previously_read_textual_information" ("roadmapPromptsId") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_e4353aadf108aa2cf2b6673409" ON "roadmap_prompts_has_previously_read_textual_information" ("textualInformationId") `,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_prompts" ADD CONSTRAINT "FK_ffc5b3700c10e1d37513f87eb74" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmaps" ADD CONSTRAINT "FK_84ef4e7cf44ea46fa4fb1127c7d" FOREIGN KEY ("promptId") REFERENCES "roadmap_prompts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmaps" ADD CONSTRAINT "FK_29f718c5a5cb41f2266d21ba207" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_nodes" ADD CONSTRAINT "FK_4dbc185f16b2ce3d4306e31f016" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_nodes" ADD CONSTRAINT "FK_a8ad9498b89f9cd2a2e0bc1ed29" FOREIGN KEY ("parentId") REFERENCES "roadmap_nodes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_nodes" ADD CONSTRAINT "FK_5e9883fe164e9b2ce8a3686bf28" FOREIGN KEY ("infoId") REFERENCES "textual_information"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_prompts_has_previously_read_textual_information" ADD CONSTRAINT "FK_dde081c076609e36e3fbb8c6af9" FOREIGN KEY ("roadmapPromptsId") REFERENCES "roadmap_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_prompts_has_previously_read_textual_information" ADD CONSTRAINT "FK_e4353aadf108aa2cf2b66734098" FOREIGN KEY ("textualInformationId") REFERENCES "textual_information"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "roadmap_prompts_has_previously_read_textual_information" DROP CONSTRAINT "FK_e4353aadf108aa2cf2b66734098"`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_prompts_has_previously_read_textual_information" DROP CONSTRAINT "FK_dde081c076609e36e3fbb8c6af9"`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_nodes" DROP CONSTRAINT "FK_5e9883fe164e9b2ce8a3686bf28"`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_nodes" DROP CONSTRAINT "FK_a8ad9498b89f9cd2a2e0bc1ed29"`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_nodes" DROP CONSTRAINT "FK_4dbc185f16b2ce3d4306e31f016"`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmaps" DROP CONSTRAINT "FK_29f718c5a5cb41f2266d21ba207"`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmaps" DROP CONSTRAINT "FK_84ef4e7cf44ea46fa4fb1127c7d"`,
        );
        await queryRunner.query(
            `ALTER TABLE "roadmap_prompts" DROP CONSTRAINT "FK_ffc5b3700c10e1d37513f87eb74"`,
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_e4353aadf108aa2cf2b6673409"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dde081c076609e36e3fbb8c6af"`);
        await queryRunner.query(
            `DROP TABLE "roadmap_prompts_has_previously_read_textual_information"`,
        );
        await queryRunner.query(`DROP TABLE "roadmap_nodes"`);
        await queryRunner.query(`DROP TABLE "roadmaps"`);
        await queryRunner.query(`DROP TABLE "roadmap_prompts"`);
        await queryRunner.query(`DROP TYPE "public"."roadmap_prompts_self_assessment_level_enum"`);
    }
}

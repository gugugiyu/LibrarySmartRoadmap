import { MigrationInterface, QueryRunner } from 'typeorm';

export class AbstractFieldToBook1761360548580 implements MigrationInterface {
    name = 'AbstractFieldToBook1761360548580';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" ADD "abstract" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "abstract"`);
    }
}

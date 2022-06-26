import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProduct implements MigrationInterface {
  name = 'CreateProduct1655983050089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Product" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" CHARACTER VARYING,
                "soldAmount" integer,
                "price" integer,
                "description" CHARACTER VARYING,
                "extraInformation" CHARACTER VARYING,
                "imgUrl" CHARACTER VARYING
            )`,
    );
    // await queryRunner.createTable(new Table({
    //     name: 'Product',
    //     columns: [
    //         {
    //             name: 'id',
    //             type: 'int',
    //             isPrimary: true,
    //         }
    //     ]
    // }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE Product`);
  }
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderId!: string;

  @Column()
  tokenIn!: string;

  @Column()
  tokenOut!: string;

  @Column("decimal")
  amount!: number;

  @Column({ nullable: true })
  dex!: string;

  @Column({ nullable: true })
  txHash!: string;

  @Column({ default: "pending" })
  status!: string;

  @Column({ nullable: true })
  error!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

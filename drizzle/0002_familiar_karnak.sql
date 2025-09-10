ALTER TABLE "monitoring_sessions" ALTER COLUMN "txHash" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "monitoring_sessions" ALTER COLUMN "txHash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "monitoring_sessions" ADD COLUMN "receivedAmount" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "monitoring_sessions" DROP COLUMN "txConfirmations";--> statement-breakpoint
ALTER TABLE "monitoring_sessions" DROP COLUMN "txConfirmationsRequired";
CREATE TABLE "monitoring_sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "monitoring_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"address" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"status" varchar(255) DEFAULT 'pending' NOT NULL,
	"amount" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"txHash" varchar(255) NOT NULL,
	"txConfirmations" integer DEFAULT 0 NOT NULL,
	"txConfirmationsRequired" integer DEFAULT 0 NOT NULL
);

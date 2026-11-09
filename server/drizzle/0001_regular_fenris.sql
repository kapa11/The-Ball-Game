CREATE INDEX "match_players_player_joined_idx" ON "match_players" USING btree ("player_id","joined_at");--> statement-breakpoint
CREATE INDEX "matches_created_at_idx" ON "matches" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "matches_status_created_at_idx" ON "matches" USING btree ("status","created_at");--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_red_score_check" CHECK ("matches"."red_score" >= 0);--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_blue_score_check" CHECK ("matches"."blue_score" >= 0);--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_playing_started_check" CHECK ("matches"."status" <> 'PLAYING' OR "matches"."started_at" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_terminal_ended_check" CHECK ("matches"."status" NOT IN ('COMPLETED', 'ABANDONED') OR "matches"."ended_at" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_timestamp_order_check" CHECK ("matches"."started_at" IS NULL OR "matches"."ended_at" IS NULL OR "matches"."ended_at" >= "matches"."started_at");
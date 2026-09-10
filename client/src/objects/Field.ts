import { Boundary } from "../physics/boundary/Boundary";
import { LineSegment } from "../physics/boundary/LineSegment";
import { Vector2 } from "../math/Vector2";

export class Field {

    static readonly SCALE = 10;

    static readonly WORLD_MARGIN_X = 120;
    static readonly WORLD_MARGIN_Y = 80;

    static readonly PITCH_WIDTH = 105 * Field.SCALE;
    static readonly PITCH_HEIGHT = 68 * Field.SCALE;


    static readonly GOAL_WIDTH = 12 * Field.SCALE;
    static readonly GOAL_DEPTH = 5 * Field.SCALE;
    static readonly GOAL_OPENING = Field.GOAL_WIDTH;
    static readonly GOAL_POST_RADIUS = 4;

    static readonly CENTRE_CIRCLE_RADIUS = 9.15 * Field.SCALE;

    static readonly PENALTY_AREA_DEPTH = 16.5 * Field.SCALE;
    static readonly PENALTY_AREA_WIDTH = 40.32 * Field.SCALE;

    static readonly GOAL_AREA_DEPTH = 5.5 * Field.SCALE;
    static readonly GOAL_AREA_WIDTH = 18.32 * Field.SCALE;

    static readonly PENALTY_SPOT_DISTANCE = 11 * Field.SCALE;
    static readonly PENALTY_ARC_RADIUS = 9.15 * Field.SCALE;

    readonly boundary: Boundary;

    constructor() {
        this.boundary = this.createBoundary();
    }

    private createBoundary(): Boundary {
        const boundary = new Boundary();

        const left = Field.WORLD_MARGIN_X;
        const right = left + Field.PITCH_WIDTH;

        const top = Field.WORLD_MARGIN_Y;
        const bottom = top + Field.PITCH_HEIGHT;

        const goalTop = top + (Field.PITCH_HEIGHT - Field.GOAL_WIDTH) / 2;
        const goalBottom = goalTop + Field.GOAL_WIDTH;
        const leftGoalBack = left - Field.GOAL_DEPTH;
        const rightGoalBack = right + Field.GOAL_DEPTH;

        // Top
        boundary.addShape(
            new LineSegment(
                new Vector2(left, top),
                new Vector2(right, top)
            )
        );

        // Bottom
        boundary.addShape(
            new LineSegment(
                new Vector2(left, bottom),
                new Vector2(right, bottom)
            )
        );

        // Left upper
        boundary.addShape(
            new LineSegment(
                new Vector2(left, top),
                new Vector2(left, goalTop)
            )
        );

        // Left lower
        boundary.addShape(
            new LineSegment(
                new Vector2(left, goalBottom),
                new Vector2(left, bottom)
            )
        );

        // Left goal top
        boundary.addShape(
            new LineSegment(
                new Vector2(left, goalTop),
                new Vector2(leftGoalBack, goalTop)
            )
        );

        // Left goal bottom
        boundary.addShape(
            new LineSegment(
                new Vector2(leftGoalBack, goalBottom),
                new Vector2(left, goalBottom)
            )
        );

        // Left goal back
        boundary.addShape(
            new LineSegment(
                new Vector2(leftGoalBack, goalTop),
                new Vector2(leftGoalBack, goalBottom)
            )
        );

        // Right upper
        boundary.addShape(
            new LineSegment(
                new Vector2(right, top),
                new Vector2(right, goalTop)
            )
        );

        // Right lower
        boundary.addShape(
            new LineSegment(
                new Vector2(right, goalBottom),
                new Vector2(right, bottom)
            )
        );

        // Right goal top
        boundary.addShape(
            new LineSegment(
                new Vector2(right, goalTop),
                new Vector2(rightGoalBack, goalTop)
            )
        );

        // Right goal bottom
        boundary.addShape(
            new LineSegment(
                new Vector2(right, goalBottom),
                new Vector2(rightGoalBack, goalBottom)
            )
        );

        // Right goal back
        boundary.addShape(
            new LineSegment(
                new Vector2(rightGoalBack, goalTop),
                new Vector2(rightGoalBack, goalBottom)
            )
        );

        return boundary;
    }
}
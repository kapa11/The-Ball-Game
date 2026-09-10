import { Graphics } from "pixi.js";
import { Field } from "../objects/Field";

export class FieldRenderer extends Graphics {

    static readonly GRASS_COLOR = 0x4c8527;
    static readonly LINE_COLOR = 0xffffff;
    static readonly LINE_WIDTH = 3;
    constructor() {
        super();

        this.drawGrass();
        this.drawPitchMarkings();
    }

    // rendering methods go here
    private tracePitch(): this {

        const left = Field.WORLD_MARGIN_X;
        const right = left + Field.PITCH_WIDTH;

        const top = Field.WORLD_MARGIN_Y;
        const bottom = top + Field.PITCH_HEIGHT;

        const goalTop = top + (Field.PITCH_HEIGHT - Field.GOAL_WIDTH) / 2;
        const goalBottom = goalTop + Field.GOAL_WIDTH;

        const depth = Field.GOAL_DEPTH;

        this
            .moveTo(left, top)

            .lineTo(right, top)

            .lineTo(right, goalTop)

            .lineTo(right + depth, goalTop)
            .lineTo(right + depth, goalBottom)
            .lineTo(right, goalBottom)

            .lineTo(right, bottom)

            .lineTo(left, bottom)

            .lineTo(left, goalBottom)

            .lineTo(left - depth, goalBottom)
            .lineTo(left - depth, goalTop)
            .lineTo(left, goalTop)

            .lineTo(left, top);

        return this;
    }

    private drawGrass() {
        this
            .tracePitch()
            .fill({ color: FieldRenderer.GRASS_COLOR });

        // Alternate mowing stripes
        const stripeWidth = 5 * Field.SCALE;

        for (
            let x = Field.WORLD_MARGIN_X;
            x < Field.WORLD_MARGIN_X + Field.PITCH_WIDTH;
            x += stripeWidth * 2
        ) {
            this
                .rect(
                    x,
                    Field.WORLD_MARGIN_Y,
                    stripeWidth,
                    Field.PITCH_HEIGHT
                )
                .fill({
                    color: 0x5b9434,
                    alpha: 1
                });
        }
    }

    private drawPitchMarkings() {
        this.drawBoundary();
        this.drawHalfwayLine();
        this.drawCentreCircle();
        this.drawPenaltyAreas();
        this.drawGoalAreas();
        this.drawPenaltySpots();
        this.drawCornerArcs();
        this.drawGoalPosts();
    }

    private drawBoundary() {
        this
            .tracePitch()
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });
    }

    private drawHalfwayLine() {

        const centreX = Field.WORLD_MARGIN_X + Field.PITCH_WIDTH / 2;

        this
            .moveTo(
                centreX,
                Field.WORLD_MARGIN_Y
            )
            .lineTo(
                centreX,
                Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT
            )
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });
    }

    private drawCentreCircle() {

        const centreX = Field.WORLD_MARGIN_X + Field.PITCH_WIDTH / 2;
        const centreY = Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2;

        // Centre Circle
        this
            .circle(
                centreX,
                centreY,
                Field.CENTRE_CIRCLE_RADIUS
            )
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });

        // Centre Spot
        this
            .circle(
                centreX,
                centreY,
                3
            )
            .fill({
                color: FieldRenderer.LINE_COLOR
            });
    }

    private drawPenaltyAreas() {

        const top = Field.WORLD_MARGIN_Y + (Field.PITCH_HEIGHT - Field.PENALTY_AREA_WIDTH) / 2;

        // Left Penalty Area
        this
            .rect(
                Field.WORLD_MARGIN_X,
                top,
                Field.PENALTY_AREA_DEPTH,
                Field.PENALTY_AREA_WIDTH
            )
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });

        // Right Penalty Area
        this
            .rect(
                Field.WORLD_MARGIN_X + Field.PITCH_WIDTH - Field.PENALTY_AREA_DEPTH,
                top,
                Field.PENALTY_AREA_DEPTH,
                Field.PENALTY_AREA_WIDTH
            )
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });
    }

    private drawGoalAreas() {

        const top = Field.WORLD_MARGIN_Y + (Field.PITCH_HEIGHT - Field.GOAL_AREA_WIDTH) / 2;

        // Left Goal Area
        this
            .rect(
                Field.WORLD_MARGIN_X,
                top,
                Field.GOAL_AREA_DEPTH,
                Field.GOAL_AREA_WIDTH
            )
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });

        // Right Goal Area
        this
            .rect(
                Field.WORLD_MARGIN_X + Field.PITCH_WIDTH - Field.GOAL_AREA_DEPTH,
                top,
                Field.GOAL_AREA_DEPTH,
                Field.GOAL_AREA_WIDTH
            )
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });

        const centreY = Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2;

        // Left D
        const leftPenaltyCentreX = Field.WORLD_MARGIN_X + Field.PENALTY_SPOT_DISTANCE;

        const startAngle = -0.92;
        const endAngle = 0.92;

        this
            .moveTo(
                leftPenaltyCentreX + Math.cos(startAngle) * Field.PENALTY_ARC_RADIUS,
                centreY + Math.sin(startAngle) * Field.PENALTY_ARC_RADIUS
            )
            .arc(
                leftPenaltyCentreX,
                centreY,
                Field.PENALTY_ARC_RADIUS,
                startAngle,
                endAngle
            )
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
        });

        // Right D
        const rightPenaltyCentreX = Field.WORLD_MARGIN_X + Field.PITCH_WIDTH - Field.PENALTY_SPOT_DISTANCE;

        const rightStart = Math.PI - 0.92;
        const rightEnd = Math.PI + 0.92;

        this
            .moveTo(
                rightPenaltyCentreX +
                    Math.cos(rightStart) * Field.PENALTY_ARC_RADIUS,
                centreY +
                    Math.sin(rightStart) * Field.PENALTY_ARC_RADIUS
            )
            .arc(
                rightPenaltyCentreX,
                centreY,
                Field.PENALTY_ARC_RADIUS,
                rightStart,
                rightEnd
            )
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
        });
    }

    private drawPenaltySpots() {

        const centreY = Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2;

        // Left Spot
        this
            .circle(
                Field.WORLD_MARGIN_X + Field.PENALTY_SPOT_DISTANCE,
                centreY,
                3
            )
            .fill({
                color: FieldRenderer.LINE_COLOR
            });

        // Right Spot
        this
            .circle(
                Field.WORLD_MARGIN_X + Field.PITCH_WIDTH - Field.PENALTY_SPOT_DISTANCE,
                centreY,
                3
            )
            .fill({
                color: FieldRenderer.LINE_COLOR
            });
    }

    private drawCornerArcs() {

        const r = Field.CENTRE_CIRCLE_RADIUS / 9.15;   // = SCALE = 10 px

        const left = Field.WORLD_MARGIN_X;
        const right = Field.WORLD_MARGIN_X + Field.PITCH_WIDTH;

        const top = Field.WORLD_MARGIN_Y;
        const bottom = Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT;

        // Top Left
        this
            .moveTo(left + r, top)
            .arc(left, top, r, 0, Math.PI / 2)
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });

        // Bottom Left
        this
            .arc(left, bottom, r, -Math.PI / 2, 0)
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });

        // Top Right
        this
            .arc(right, top, r, Math.PI / 2, Math.PI)
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });

        // Bottom Right
        this
            .arc(right, bottom, r, Math.PI, Math.PI * 1.5)
            .stroke({
                color: FieldRenderer.LINE_COLOR,
                width: FieldRenderer.LINE_WIDTH
            });
    }

    private drawGoalPosts() {

    const left = Field.WORLD_MARGIN_X;
    const right = left + Field.PITCH_WIDTH;

    const centreY = Field.WORLD_MARGIN_Y + Field.PITCH_HEIGHT / 2;

    const topPostY = centreY - Field.GOAL_WIDTH / 2;
    const bottomPostY = centreY + Field.GOAL_WIDTH / 2;

    // Left Top
    this
        .circle(left, topPostY, Field.GOAL_POST_RADIUS)
        .fill({ color: FieldRenderer.LINE_COLOR });

    // Left Bottom
    this
        .circle(left, bottomPostY, Field.GOAL_POST_RADIUS)
        .fill({ color: FieldRenderer.LINE_COLOR });

    // Right Top
    this
        .circle(right, topPostY, Field.GOAL_POST_RADIUS)
        .fill({ color: FieldRenderer.LINE_COLOR });

    // Right Bottom
    this
        .circle(right, bottomPostY, Field.GOAL_POST_RADIUS)
        .fill({ color: FieldRenderer.LINE_COLOR });
    }
}

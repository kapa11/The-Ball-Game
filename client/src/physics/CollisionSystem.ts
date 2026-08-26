import { Ball } from "../objects/Ball";
import { Vector2 } from "../math/Vector2";
import { Boundary } from "./boundary/Boundary";
import { LineSegment } from "./boundary/LineSegment";
import { Collision } from "./Collision";
import { closestPointOnLineSegment } from "./geometry/ClosestPoint";

export class CollisionSystem {

    static resolveBallBoundaryCollision(ball: Ball, boundary: Boundary, restitution: number): void {
        for (const shape of boundary.shapes) {

            let collision: Collision | null = null;

            if (shape instanceof LineSegment) {
                collision = this.checkLineSegmentCollision(ball, shape);
            }

            if (collision !== null) {
                this.resolveBallCollision(ball, collision, restitution);
            }
        }
    }

    private static checkLineSegmentCollision(ball: Ball, segment: LineSegment): Collision | null {

        const closestPoint = closestPointOnLineSegment(ball.physicsPosition,segment);

        const distanceVector = ball.physicsPosition.sub(closestPoint);

        const distanceSquared = distanceVector.lengthSq();

        if (distanceSquared > Ball.BALL_RADIUS * Ball.BALL_RADIUS) {
            return null;
        }

        const distance = Math.sqrt(distanceSquared);

        if (distance === 0) {
            return null;
        }

        const normal = distanceVector.normalize();

        const penetration = Ball.BALL_RADIUS - distance;

        return new Collision(segment, closestPoint, normal, penetration);
    }

    private static resolveBallCollision(ball: Ball, collision: Collision, restitution: number): void {

        // De-penetration
        ball.physicsPosition = ball.physicsPosition.add(collision.normal.scale(collision.penetration));

        // Collision response
        const velocityAlongNormal = ball.velocity.dot(collision.normal);

        if (velocityAlongNormal < 0) {
            ball.velocity = ball.velocity.sub(collision.normal.scale((1 + restitution)*velocityAlongNormal));
        }

        ball.x = ball.physicsPosition.x;
        ball.y = ball.physicsPosition.y;
    }
}
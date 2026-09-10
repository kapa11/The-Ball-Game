import { Ball } from "../objects/Ball";
import { Boundary } from "./boundary/Boundary";
import { LineSegment } from "./boundary/LineSegment";
import { Collision } from "./Collision";
import { closestPointOnLineSegment } from "./geometry/ClosestPoint";
import { PhysicsBody } from "./PhysicsBody";

export class CollisionSystem {

    static resolveBodyCollision(bodyA: PhysicsBody, bodyB: PhysicsBody, restitution: number): void {

        const distanceVector = bodyB.physicsPosition.sub(bodyA.physicsPosition);

        const distanceSquared = distanceVector.lengthSq();

        const radiusSum = bodyA.radius + bodyB.radius;

        if (distanceSquared > radiusSum * radiusSum) {
            return;
        }

        const distance = Math.sqrt(distanceSquared);

        if (distance === 0) {
                return;
            }

        const normal = distanceVector.normalize();

        // De-penetration
            const overlap = radiusSum - distance;
            const correction = normal.scale(overlap / 2);

            bodyA.physicsPosition =
                bodyA.physicsPosition.sub(correction);

            bodyB.physicsPosition =
                bodyB.physicsPosition.add(correction);

            // Collision resolution
            const relativeVelocity =
                bodyB.velocity.sub(bodyA.velocity);

            const velocityAlongNormal =
                relativeVelocity.dot(normal);

            if (velocityAlongNormal > 0) {
                return;
            }

            const impulseMagnitude = -(1 + restitution) * velocityAlongNormal / ((1 / bodyA.mass) + (1 / bodyB.mass));

            const impulse = normal.scale(impulseMagnitude);
            bodyA.velocity = bodyA.velocity.sub(impulse.scale(1 / bodyA.mass));
            bodyB.velocity = bodyB.velocity.add(impulse.scale(1 / bodyB.mass));
    }

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
    }

    static applyKick(player: PhysicsBody, ball: PhysicsBody, impulseMagnitude: number): void {
        const kickDirection = ball.physicsPosition.sub(player.physicsPosition).normalize();

        const impulse = kickDirection.scale(impulseMagnitude);

        ball.velocity = ball.velocity.add(impulse.scale(1 / ball.mass));
    }
}
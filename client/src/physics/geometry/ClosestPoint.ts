import { Vector2 } from "../../math/Vector2";
import { LineSegment } from "../boundary/LineSegment";

export function closestPointOnLineSegment(point: Vector2, segment: LineSegment): Vector2 {

    const segmentVector = segment.end.sub(segment.start);

    const pointVector = point.sub(segment.start);

    const segmentLengthSquared = segmentVector.lengthSq();

    let t = pointVector.dot(segmentVector) / segmentLengthSquared;

    t = Math.max(0, Math.min(1, t));

    return segment.start.add(segmentVector.scale(t));
}
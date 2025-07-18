export interface LivenessScore {
  liveness_score: number;
}

export interface IdLivenessResponse {
  apiType: string;
  transactionId: string;
  result: {
    screenReplay: LivenessScore;
    paperPrinted: LivenessScore;
    replacePortraits: LivenessScore;
  };
}

export interface FaceCompareResponse {
  apiType: string;
  transactionId: string;
  result: {
    face: Face;
    faceMatch: FaceMatch;
  };
}

export interface RecognitionResponse {
  apiType: string;
  transactionId: string;
  result: any;
}

export interface FaceLivenessResponse {
  apiType: string;
  transactionId: string;
  result: LivenessScore;
}

interface Face {
  isAvailable: boolean;
  boundingBox: BoundingBox;
}

interface FaceMatch {
  isAvailable: boolean;
  boundingBox: BoundingBox;
  similarity: number;
  confidence: number;
  landmarks: Landmark[];
  pose: Pose;
  quality: Quality;
}

interface BoundingBox {
  Width: number;
  Height: number;
  Left: number;
  Top: number;
}

interface Landmark {
  Type: string;
  X: number;
  Y: number;
}

interface Pose {
  Roll: number;
  Yaw: number;
  Pitch: number;
}

interface Quality {
  Brightness: number;
  Sharpness: number;
} 
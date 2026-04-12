import { Request, Response } from "express";
import SkinAnalysis from "../models/skinAnalysismodel";
import ProductItem, { SkinTyp } from "../models/productItems";
import { mapSkinType, SkinAdviceforSkinAnalyse } from "../utils/skinTypeMapper";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const analyseSkinFromBuffer = async (
  imageBuffer: Buffer
): Promise<{
  diagnosis: string;
  skinType: SkinTyp;
}> => {
  const imageBase64 = imageBuffer.toString("base64");

  const response = await axios.post(
    "https://api-us.faceplusplus.com/facepp/v1/skinanalyze",
    new URLSearchParams({
      api_key: process.env.FACE_API_KEY || "",
      api_secret: process.env.FACE_API_SECRET || "",
      image_base64: imageBase64,
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const result = response.data.result;

  const skinProblems: string[] = [];

  if (result.acne?.value === 0.3) skinProblems.push("Blemishes (acne)");
  if (result.dark_circle?.value === 1)
    skinProblems.push("Dark circles under the eyes");
  if (result.nasolabial_fold?.value === 1)
    skinProblems.push("Pronounced lines around the mouth (nasolabial folds)");
  if (result.forehead_wrinkle?.value === 1)
    skinProblems.push("Forehead wrinkles");
  if (result.eye_pouch?.value === 1)
    skinProblems.push("Under-eye bags (puffiness)");
  if (result.mole?.value === 1)
    skinProblems.push("Pigmentation spots or moles");
  if (result.skin_spot?.value === 0.4)
    skinProblems.push("Skin discoloration or spots");
  if (result.blackhead?.value === 1)
    skinProblems.push("Blackheads (open pores)");
  if (result.left_eyelids?.value >= 1 || result.right_eyelids?.value >= 1)
    skinProblems.push("Swollen eyelids");

  const skinType = mapSkinType(result.skin_type?.skin_type);

  return {
    diagnosis:
      skinProblems.length > 0
        ? skinProblems.join(", ")
        : "No visible skin concerns detected",
    skinType,
  };
};

async function analyseSkin(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!file || !userId) {
      res.status(400).json({
        message: "Please upload a photo and make sure you are logged in.",
      });
      return;
    }

    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      res.status(400).json({
        message: "Something went wrong—please log in again.",
      });
      return;
    }

    const { diagnosis, skinType } = await analyseSkinFromBuffer(file.buffer);

    const recommendedProducts = await ProductItem.find({
      skin_typ_target: skinType,
    });

    const result = await SkinAnalysis.create({
      userId: numericUserId,
      imageUrl: "",
      diagnostic: diagnosis,
      skin_typ_target: skinType,
      recommendedProducts: recommendedProducts.map((p) => p._id),
    });

    res.status(200).json({
      message: "Skin analysis completed successfully",
      diagnosis,
      skinType,
      recommendedProducts,
      skinAdvice: SkinAdviceforSkinAnalyse(skinType),
    });

    console.log("Received userId:", userId);
    console.log("File present:", !!file);
  } catch (err) {
    console.error("Error during skin analysis:", err);
    res.status(500).json({
      error: "Skin analysis could not be completed.",
      hint: "Please upload a clear photo of your face and try again.",
      details: (err as Error).message,
    });
  }
}

export { analyseSkin };

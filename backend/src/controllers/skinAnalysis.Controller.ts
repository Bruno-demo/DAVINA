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
  diagnose: string;
  hauttyp: SkinTyp;
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

  const hautprobleme: string[] = [];

  if (result.acne?.value === 0.3) hautprobleme.push("Unreine Haut (Akne)");
  if (result.dark_circle?.value === 1)
    hautprobleme.push("Dunkle Schatten unter den Augen (Augenringe)");
  if (result.nasolabial_fold?.value === 1)
    hautprobleme.push("Ausgeprägte Linien um den Mund (Nasolabialfalten)");
  if (result.forehead_wrinkle?.value === 1)
    hautprobleme.push("Falten auf der Stirn");
  if (result.eye_pouch?.value === 1)
    hautprobleme.push("Geschwollene Unterlider (Tränensäcke)");
  if (result.mole?.value === 1)
    hautprobleme.push("Pigmentflecken oder Muttermale");
  if (result.skin_spot?.value === 0.4)
    hautprobleme.push("Hautverfärbungen oder Flecken");
  if (result.blackhead?.value === 1)
    hautprobleme.push("Mitesser (offene Poren)");
  if (result.left_eyelids?.value >= 1 || result.right_eyelids?.value >= 1)
    hautprobleme.push("Geschwollene Augenlider");

  const hauttyp = mapSkinType(result.skin_type?.skin_type);

  return {
    diagnose:
      hautprobleme.length > 0
        ? hautprobleme.join(", ")
        : "Keine sichtbaren Hautprobleme erkannt",
    hauttyp,
  };
};

async function analyseSkin(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!file || !userId) {
      res.status(400).json({
        message:
          "Bitte lade ein Foto hoch und stelle sicher, dass du eingeloggt bist.",
      });
      return;
    }

    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      res.status(400).json({
        message: "Ein Fehler ist aufgetreten – bitte melde dich erneut an.",
      });
      return;
    }

    const { diagnose, hauttyp } = await analyseSkinFromBuffer(file.buffer);

    const empfohleneProdukte = await ProductItem.find({
      skin_typ_target: hauttyp,
    });

    const result = await SkinAnalysis.create({
      userId: numericUserId,
      imageUrl: "",
      diagnostic: diagnose,
      skin_typ_target: hauttyp,
      recommendedProducts: empfohleneProdukte.map((p) => p._id),
    });

    res.status(200).json({
      nachricht: "Hautanalyse erfolgreich durchgeführt",
      diagnose,
      hauttyp,
      empfohleneProdukte,
      pflegeempfehlung: SkinAdviceforSkinAnalyse(hauttyp),
    });

    console.log("Received userId:", userId);
    console.log("File present:", !!file);
  } catch (err) {
    console.error("Fehler bei der Hautanalyse:", err);
    res.status(500).json({
      fehler: "Die Hautanalyse konnte leider nicht durchgeführt werden.",
      hinweis:
        "Bitte lade ein klares Bild von deinem Gesicht hoch und versuche es erneut.",
      details: (err as Error).message,
    });
  }
}

export { analyseSkin };

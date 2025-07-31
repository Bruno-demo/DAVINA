import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import qs from "qs";

dotenv.config();

const imageBase64: string = fs.readFileSync("./test.jpg", {
  encoding: "base64",
});

async function testFaceApi(): Promise<void> {
  try {
    const payload = qs.stringify({
      api_key: process.env.FACE_API_KEY,
      api_secret: process.env.FACE_API_SECRET,
      image_base64: imageBase64,
    });

    const response = await axios.post(
      "https://api-us.faceplusplus.com/facepp/v1/skinanalyze",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("✅ Réponse API Face++ :");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error("❌ Erreur API :", error.response?.data || error.message);
  }
}

testFaceApi();

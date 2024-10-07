import { Request, Response } from "express";
import { extractVideoData } from "../services/videoService";

export const extractVideoSource = async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL é necessaria" });
  }

  try {
    const videoData = await extractVideoData(url);
    res.json(videoData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.myamarilis.web.id";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/transparansi`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kegiatan`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pengurus`,
      lastModified: new Date(),
      priority: 0.8,
    }
  ];
}
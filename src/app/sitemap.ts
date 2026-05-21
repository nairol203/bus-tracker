import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://bus.nairol.de",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
  ];
}

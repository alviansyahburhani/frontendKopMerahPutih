export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;     // URL gambar (local / remote)
  publishedAt: string; // ISO string
};

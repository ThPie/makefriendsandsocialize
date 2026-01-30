export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  readTime: string;
  excerpt: string;
  image: string;
  featured?: boolean;
  content: {
    intro: string;
    sections: {
      title?: string;
      content: string;
      quote?: {
        text: string;
        author: string;
      };
      image?: string;
    }[];
  };
}

// Blog articles - cleared for fresh real content
export const blogArticles: BlogArticle[] = [];

export const blogCategories = [
  "All Posts",
  "Making Friends",
  "Networking Tips",
  "Dating & Relationships",
  "Community Stories",
  "Business & Growth",
];

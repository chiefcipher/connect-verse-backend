declare module "unfluff" {
  interface UnfluffData {
    title: string;
    softTitle: string;
    date?: string;
    author?: string;
    publisher?: string;
    text: string;
    videos: string[];
    tags: string[];
    canonicalLink: string;
  }

  function unfluff(html: string): UnfluffData;

  export = unfluff;
}

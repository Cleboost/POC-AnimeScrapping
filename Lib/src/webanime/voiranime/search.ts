import { VOIRANIME_HEADERS } from "../shared/headers.js";

export interface VoiranimeSearchItem {
  id: string;
  title: string;
  link: string;
  affiche: string;
  synopsis: string;
}

export async function searchVoiranime(query: string): Promise<VoiranimeSearchItem[]> {
  const url = "https://voir-anime.to/wp-admin/admin-ajax.php";
  const params = new URLSearchParams();
  params.append("action", "ajaxsearchpro_search");
  params.append("aspp", query);
  params.append("asid", "2");
  params.append("asp_inst_id", "2_1");
  params.append("options", "qtranslate_lang=0&set_imagecache=&set_customfields=");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...VOIRANIME_HEADERS,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  const dataMatch = text.match(/___ASPSTART_DATA___(.*?)___ASPEND_DATA___/s);
  if (!dataMatch) return [];

  const data = JSON.parse(dataMatch[1]) as {
    results: Array<{
      id: string;
      title: string;
      link: string;
      image: string;
      content: string;
    }>;
  };

  return data.results.map((a) => ({
    id: a.id,
    title: a.title,
    link: a.link,
    affiche: a.image,
    synopsis: a.content,
  }));
}

import Image from "next/image";

const links = [
  {
    label: "Channel",
    url: "https://www.youtube.com/@pacelite",
    img: "https://yt3.googleusercontent.com/ytc/AIdro_knY8eHlnphUOTtDGL_Kf3RV_EG-gY1xeN7Hv-skQ=s176-c-k-c0x00ffffff-no-rj",
  },
  {
    label: "Studio",
    url: "https://studio.youtube.com/channel/UC2Y71nJHtoLzY88Wrrqm7Kw/content/playlists",
    img: "/links/studio.webp",
  },
  {
    label: "Playlist Length",
    url: "https://ytplaylist-len.sharats.dev/",
    img: "https://ytplaylist-len.sharats.dev/static/favicon.png",
  },
  {
    label: "The Last Game",
    url: "https://thelastgame.ru/",
    img: "https://thelastgame.ru/wp-content/uploads/2017/07/cropped-gamecontroller-512-300x300.png",
  },
  {
    label: "Igruha",
    url: "https://itorrents-igruha.org/",
    img: "https://itorrents-igruha.org/favicon.ico",
  },
  {
    label: "SteamGridDB",
    url: "https://www.steamgriddb.com",
    img: "https://www.steamgriddb.com/static/favicon/16.png",
  },
];

const size = 65;

export default function Links() {
  return (
    <div>
      {links.map((link) => (
        <a href={link.url} key={link.url} title={link.label} target="_blank">
          <Image src={link.img} alt={link.label} width={size} height={size} />
        </a>
      ))}
    </div>
  );
}

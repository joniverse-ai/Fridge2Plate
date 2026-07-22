interface YoutubeEmbedProps {
  videoId: string;
  title: string;
}

const YOUTUBE_VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export default function YoutubeEmbed({ videoId, title }: YoutubeEmbedProps) {
  if (!YOUTUBE_VIDEO_ID_RE.test(videoId)) return null;

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

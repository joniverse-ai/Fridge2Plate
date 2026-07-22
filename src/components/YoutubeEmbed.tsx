interface YoutubeEmbedProps {
  videoId: string;
  title: string;
}

export default function YoutubeEmbed({ videoId, title }: YoutubeEmbedProps) {
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

interface StarRatingProps {
  count?: number;
  className?: string;
}

export function StarRating({ count = 5, className = 'flex gap-1 text-warm' }: StarRatingProps) {
  return (
    <div className={className} aria-label={`${count} estrelas`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} aria-hidden="true" className="text-lg">★</span>
      ))}
    </div>
  );
}

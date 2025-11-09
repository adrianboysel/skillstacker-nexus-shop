import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsProps {
  reviews?: Review[];
  productHandle: string;
}

export const ProductReviews = ({ reviews = [], productHandle }: ProductReviewsProps) => {
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(star => 
    reviews.filter(r => r.rating === star).length
  );

  const StarRating = ({ rating, size = "h-5 w-5" }: { rating: number; size?: string }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? "fill-primary text-primary"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="space-y-8">
      {/* Reviews Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Customer Reviews</h2>
        <p className="text-muted-foreground">
          {reviews.length > 0 
            ? `Based on ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`
            : 'Be the first to review this product'}
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Rating Summary */}
          <Card className="h-fit">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <div className="text-5xl font-bold text-primary">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={Math.round(averageRating)} />
                <p className="text-sm text-muted-foreground">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2 pt-4 border-t border-border">
                {[5, 4, 3, 2, 1].map((stars, idx) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8">{stars}</span>
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <Progress 
                      value={reviews.length > 0 ? (ratingCounts[idx] / reviews.length) * 100 : 0} 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {ratingCounts[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{review.customerName}</h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <StarRating rating={5} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No reviews yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share your thoughts about this product
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

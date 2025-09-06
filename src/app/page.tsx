
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center p-8 max-w-md mx-auto">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-primary">Next Inn</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Your next-generation meeting experience is just one click away.
        </p>
        <Button asChild size="lg">
          <Link href="/meeting">
            Start New Meeting <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

    
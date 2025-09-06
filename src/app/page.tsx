import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center p-8 max-w-lg mx-auto">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to <span className="text-primary">Next Inn</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Empowering the next generation of innovators through skill and collaboration.
          </p>
          <Button asChild size="lg">
            <Link href="/meeting">
              Start New Meeting <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>
      <footer className="py-4 px-8 text-center text-sm text-muted-foreground">
        <p>In collaboration with Major League Hacking</p>
      </footer>
    </div>
  );
}

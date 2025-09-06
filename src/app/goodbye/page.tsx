import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GoodbyePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center p-8 max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4">Meeting Ended</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for joining the meeting at Next Inn.
        </p>
        <Button asChild>
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}

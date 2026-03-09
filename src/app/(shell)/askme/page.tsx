import { AskMeWizard } from '@/components/askme/AskMeWizard';

export const metadata = {
  title: 'Ask Me Wizard | PromptTemple',
  description: 'Let AI guide you to craft the perfect prompt through intelligent questions',
};

export default function AskMePage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Ask Me <span className="text-[#C9A227]">Anything</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Tell me what you need — I'll ask the right questions and craft the perfect prompt.
        </p>
      </div>
      <AskMeWizard />
    </div>
  );
}

import React from 'react';
import AccordionItem from '../../../Components/Accordion';
import BlurText from '../../../Components/BlurText';

const faqs = [
  {
    q: 'What is AgaroVote?',
    a: 'AgaroVote is a hybrid governance voting system that enhances traditional voting by integrating Web3 technology. It adds transparency, security, and rewards to existing systems, allowing every vote to be both meaningful and valuable.',
  },
  {
    q: 'Do i need a crypto wallet to vote?',
    a: 'Yes, for now you’ll need a crypto wallet to vote, as it helps verify your identity and manage tokens securely. However, in the future, AgaroVote aims to make voting feeless and wallet-free, so anyone can participate easily without needing blockchain knowledge..',
  },
  {
    q: 'What voting models are available?',
    a: 'AgaroVote supports several flexible voting models. Voters commit tokens to participate, which helps prevent spam and ensure genuine engagement. Only whitelisted (approved) addresses can access certain votes for security and control. The system also includes a reward model, where voters earn yield for participation, and each voting session can have a custom duration set by the creator. This makes AgaroVote adaptable for different communities and governance needs. More models will be added in future!',
  },
  {
    q: 'How do reward mechanisms work?',
    a: 'AgaroVote uses a synthetic reward system where every token and every second committed contributes to your earnings. The longer and more you commit, the greater your reward.',
  },
  {
    q: 'Which blockchain does AgaroVote run on?',
    a: 'AgaroVote currently runs on a private blockchain for demo and internal testing. It will be deployed on a public testnet for open trials and later launched on the Ethereum mainnet for real production. The system is also designed to be compatible with all EVM-based blockchains.',
  },
];

const FAQ: React.FC = () => {
  return (
    <div className="py-16 pt-28 md:pt-44 ">
      <section className="max-w-3xl mx-auto px-4 ">
        {/* <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">
          Frequently asked questions
        </h2> */}
        <BlurText
          text="Frequently asked questions"
          delay={10}
          animateBy="letters"
          direction="bottom"
          className="sm:text-3xl text-2xl font-semibold mb-2 flex items-center justify-center "
        />
        <BlurText
          text="Answers to common questions about AgaroVote."
          delay={10}
          animateBy="letters"
          direction="bottom"
          className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 flex items-center justify-center"
        />

        <div className="space-y-8">
          {faqs.map((f, idx) => (
            <AccordionItem key={idx} title={f.q}>
              <div>{f.a}</div>
            </AccordionItem>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FAQ;

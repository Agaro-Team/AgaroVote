import React from 'react';
import AccordionItem from '../../../Components/Accordion';

const faqs = [
  {
    q: 'What is AgaroVote?',
    a: 'AgaroVote is a lightweight voting interface built on web3 principles to make decentralized voting simple and secure.',
  },
  {
    q: 'Do i need a crypto wallet to vote?',
    a: 'Click the Connect button in the header and follow the prompts to connect your wallet (MetaMask or any injected provider).',
  },
  {
    q: 'What voting models are available?',
    a: 'Votes are recorded on-chain and are publicly verifiable. You can use privacy-preserving mechanisms where available depending on the target chain.',
  },
  {
    q: 'How do reward mechanisms work?',
    a: 'Votes are recorded on-chain and are publicly verifiable. You can use privacy-preserving mechanisms where available depending on the target chain.',
  },
  {
    q: 'Which blockchain does AgaroVote run on?',
    a: 'Votes are recorded on-chain and are publicly verifiable. You can use privacy-preserving mechanisms where available depending on the target chain.',
  },
];

const FAQ: React.FC = () => {
  return (
    <div className="py-16">
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">
          Frequently asked questions
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 text-center">
          Answers to common questions about AgaroVote.
        </p>

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

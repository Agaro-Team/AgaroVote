// import AnimatedText from '../../../Animation/AnimatedText';

import BlurText from '../../../Components/BlurText';
// import { desc } from 'motion/react-client';
// import WalletBalance from '../Components/WalletBalance';

const SecondContent = () => {
  const DataContent = [
    {
      title: 'Coin-Based Power',
      icon: '/icons/coin.svg',
      description:
        'Leverage your token holdings to influence decisions. The more coins you hold, the greater your voting power, ensuring that committed stakeholders have a significant say in outcomes.',
    },
    {
      title: 'Address-Based Power',
      icon: '/icons/person.svg',
      description:
        'Each wallet address counts as one vote. A fair and equal system — one identity, one decision.',
    },
  ];

  return (
    <div className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Judul */}
      <div className="flex flex-col items-center justify-center ">
        <BlurText
          text="How It Works"
          delay={10}
          animateBy="letters"
          direction="bottom"
          className="text-4xl font-semibold"
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <BlurText
          text=" Two Ways to Define Your Voice"
          delay={10}
          animateBy="letters"
          direction="bottom"
          className="text-xl font-medium"
        />
      </div>

      <div className="flex gap-x-10 justify-center h-auto mt-10 mb-10 ">
        {/* Konten di atas blur */}
        {DataContent.map((item, index) => (
          <div
            key={index}
            className="relative z-10 px-8 py-5 rounded-xl border shadow-[0_4px_30px_rgba(0,0,0,0.1)] w-1/4 overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300"
            style={{ borderColor: 'var(--border)' }}>
            <div className="relative z-10">
              <p
                className="text-lg font-semibold mb-5"
                style={{ color: 'var(--primary)' }}>
                {item.title}
              </p>
              <p className="text-md font-semibold text-[var(--foreground)]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center ">
        <BlurText
          text="Choose the voting mode that fits your community’s needs."
          delay={10}
          animateBy="letters"
          direction="bottom"
          className="text-2xl font-medium mx-6 text-center"
        />
      </div>
    </div>
  );
};

export default SecondContent;

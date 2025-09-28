import { Element } from 'react-scroll';
import MainContent from './Content/MainContent';
import SecondContent from './Content/SecondContent';

const MainPage = () => {
  return (
    <div>
      <Element name="main">
        <MainContent />
      </Element>
      <Element name="second">
        <SecondContent />
      </Element>
    </div>
  );
};

export default MainPage;

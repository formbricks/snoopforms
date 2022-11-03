import HeroTitle from "@/components/shared/HeroTitle";
import Layout from "@/components/shared/Layout";
import ImageReactLib from "@/images/react-lib.png";
import ImageSchemaGeneration from "@/images/schema-generation-svg.svg";
import Image from "next/image";
import TryItCTA from "../components/shared/TryItCTA";
import WhyFormbricks from "../components/shared/WhyFormbricks";

const CoreAPIPage = () => (
  <Layout meta={{ title: "React Form Builder Library by Formbricks" }}>
    <HeroTitle HeadingPt1="Core" HeadingTeal="API" HeadingPt2="" />
    {/* <FeatureHighlights
      Heading1="Building React forms has never been quicker. But there is more..."
      Text1Pt1="Loads of question types, validation, multi-page forms, logic jumps, i18n, custom styles - all
              the good stuff you want, but don't want to build yourself."
      Text1Pt2="Building forms fast is great, but where do you pipe your data? And what is it worth without a
              schema?"
      Image1={<Image src={ImageReactLib} alt="react lib" />}
      Image2={<Image src={ImageReactLib} alt="react lib" />}
      Heading2="Automatic schema generation for reliable insights"
      Text2Pt1="You can only reliably analyze your submissions when the form schema is sent along with the form."
      Text2Pt2="Use our React Forms Library with the Formbricks Data Pipes and get a full image of the data
              sent. Analyze it in our Form HQ or forward it to your database."
    /> */}
    <div className="mt-8">
      <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-24">
          <Image src={ImageReactLib} alt="react library" className="rounded-lg" />
          <div>
            <h2 className="text-blue text-2xl font-bold tracking-tight dark:text-blue-100 sm:text-3xl">
              Building React forms has never been quicker. But there is more...
            </h2>
            <p className="text-md mt-6 max-w-3xl leading-7 text-gray-500 dark:text-blue-300">
              Loads of question types, validation, multi-page forms, logic jumps, i18n, custom styles - all
              the good stuff you want, but don&apos;t want to build yourself.
            </p>
            <p className="text-md mt-6 max-w-3xl leading-7 text-gray-500 dark:text-blue-300">
              Building forms fast is great, but where do you pipe your data? And what is it worth without a
              schema?
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-32">
      <div className="mx-auto -mb-14 max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-24">
          <div>
            <h2 className="text-blue text-2xl font-bold tracking-tight dark:text-blue-100 sm:text-3xl">
              Automatic schema generation for reliable insights
            </h2>
            <p className="text-md mt-6 max-w-3xl leading-7 text-gray-500 dark:text-blue-300">
              You can only reliably analyze your submissions when the form schema is sent along with the form.
            </p>
            <p className="text-md mt-6 max-w-3xl leading-7 text-gray-500 dark:text-slate-300">
              Use our React Forms Library with the Formbricks Data Pipes and get a full image of the data
              sent. Analyze it in our Form HQ or forward it to your database.
            </p>
            <div className="mt-6">
              <div className="text-base font-medium text-teal-500">coming soon</div>
            </div>
          </div>
          <Image src={ImageSchemaGeneration} alt="react library" className="rounded-lg" />
        </div>
      </div>
    </div>
    <WhyFormbricks />
    <TryItCTA />
  </Layout>
);

export default CoreAPIPage;

interface BannerProps{
    title:string;
}

const Banner = ({title}: BannerProps) =>(
    <h1 className="text-center text-3xl m-2">{title}</h1>
)

export default Banner;
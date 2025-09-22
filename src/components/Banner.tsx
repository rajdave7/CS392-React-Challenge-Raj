interface BannerProps{
    title:string;
}

const Banner = ({title}: BannerProps) =>(
    <h1>{title}</h1>
)

export default Banner;
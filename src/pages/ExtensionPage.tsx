import { useLocation, useParams } from 'react-router-dom';

export function ExtensionPage() {
    const { share_id }: { share_id?: string } = useParams();
    const location = useLocation();
    const search = location.search;

    return (
        <div className="easydapp-page">
            <div className="easydapp-page-inner">
                <div>{`https://easydapp.ai/run/${share_id}${search}`}</div>
            </div>
        </div>
    );
}

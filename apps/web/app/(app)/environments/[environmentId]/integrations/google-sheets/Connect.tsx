import { Button } from '@formbricks/ui'
import FormbricksLogo from "@/images/logo.svg"
import GoogleSheetLogo from "@/images/google-sheets-small.png"
import Image from 'next/image'
import { useState } from 'react'
import { authorize } from '@formbricks/lib/services/google'
import { authorizeAction } from '@/app/(app)/environments/[environmentId]/integrations/google-sheets/actions'


export default function Connect({environmentId,setIsConnected}) {

    const [isConnecting, setIsConnecting] = useState(false)
    const handleGoogleLogin = async () => {
        setIsConnecting(true)
        authorizeAction().then((res) => {
            if (res.ok) {
                setIsConnected(true)
                setIsConnecting(false)
            }
        })
    }

    return (
        <div className="h-full w-full flex justify-center items-center">

            <div className="bg-white shadow rounded-lg w-1/2 flex flex-col justify-center items-center p-8">
                <div className="w-1/2 flex justify-center my-4 -space-x-4">
                    <div className='w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center'>
                        <Image className="w-1/2" src={FormbricksLogo} alt="Formbricks Logo" />
                    </div>
                    <div className='w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center'>
                        <Image className="w-1/2" src={GoogleSheetLogo} alt="Google Sheet logo" />
                    </div>
                </div>
                <p className='my-4'>Sync responses directly with google Sheets.</p>
                <Button variant="darkCTA" loading={isConnecting} onClick={handleGoogleLogin}>Connect Google Sheets</Button>
            </div>
        </div>
    )
}

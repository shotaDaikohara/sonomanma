import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ロゴとサービス説明 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StayConnect</span>
            </div>
            <p className="text-gray-600 mb-4">
              興味関心でつながる新しい宿泊体験。地元の人との出会いを通じて、
              旅行をもっと特別なものにしませんか？
            </p>
          </div>

          {/* サービス */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">サービス</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-600 hover:text-gray-900">
                  宿主を探す
                </Link>
              </li>
              <li>
                <Link href="/become-host" className="text-gray-600 hover:text-gray-900">
                  宿主になる
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">
                  使い方
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-gray-900">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-600 hover:text-gray-900">
                  安全について
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-center text-gray-500">
            © 2024 StayConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
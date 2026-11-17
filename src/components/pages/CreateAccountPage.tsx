import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { auth } from '../../lib/localAuth';
import { EditorialPageLayout } from '../classic/layout/EditorialPageLayout';

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('계정 이름(작업자명)을 입력해 주세요.');
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      await auth.signInLocal({
        displayName: name.trim(),
        email: email.trim() || undefined,
        companyName: team.trim() || undefined,
        pin: pin.trim() || undefined,
        rememberMe: true,
        role: 'ADMIN',
      });
      navigate('/workspace');
    } catch (err: any) {
      setError(err?.message || '로컬 계정 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <EditorialPageLayout
      category="LOCAL-FIRST IDENTITY"
      title="로컬 계정 만들기"
      subtitle="외부 서버에 등록하지 않고 브라우저 로컬 저장소에만 보관되는 독립 작업자 계정을 생성하고 즉시 전환합니다."
      maxWidthClass="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="border border-[#000000] bg-[#FFFFFF] p-8 sm:p-12 space-y-7">
        {error && (
          <div className="p-4 bg-[#FEF2F2] border border-[#DC2626] text-[17px] font-bold text-[#DC2626]">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-[17px] font-extrabold text-[#000000]">이름 / 닉네임 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 홍길동 디렉터"
            className="w-full px-4 py-3.5 border border-[#CBC8BF] focus:border-[#000000] rounded-none text-[19px] outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[17px] font-extrabold text-[#000000]">이메일 (선택)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="director@studio.local"
            className="w-full px-4 py-3.5 border border-[#CBC8BF] focus:border-[#000000] rounded-none text-[19px] outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[17px] font-extrabold text-[#000000]">소속 / 팀명 (선택)</label>
            <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Goguma Studio"
              className="w-full px-4 py-3.5 border border-[#CBC8BF] focus:border-[#000000] rounded-none text-[19px] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[17px] font-extrabold text-[#000000]">보안 PIN (선택)</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4자리 숫자"
              maxLength={8}
              className="w-full px-4 py-3.5 border border-[#CBC8BF] focus:border-[#000000] rounded-none text-[19px] outline-none"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-[#E4E2DC] flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="px-6 py-3.5 border border-[#CBC8BF] hover:border-[#000000] text-[17px] font-bold text-[#000000] rounded-none cursor-pointer"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-7 py-3.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[18px] font-bold rounded-none transition-colors cursor-pointer flex items-center gap-2.5 disabled:opacity-50"
          >
            <span>{isCreating ? '생성 중...' : '로컬 계정 생성 및 시작'}</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </EditorialPageLayout>
  );
}
